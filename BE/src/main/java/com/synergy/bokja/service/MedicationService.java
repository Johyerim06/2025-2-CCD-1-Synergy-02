package com.synergy.bokja.service;

import com.synergy.bokja.dto.*;
import com.synergy.bokja.entity.*;
import com.synergy.bokja.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.sql.Date;
import java.sql.Timestamp;
import java.text.Normalizer;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

import static java.time.LocalDateTime.now;

@Service
@RequiredArgsConstructor
public class MedicationService {

    private final UserRepository userRepository;
    private final UserMedicineRepository userMedicineRepository;
    private final UserMedicineItemRepository userMedicineItemRepository;
    private final MedicineRepository medicineRepository;
    private final CycleRepository cycleRepository;
    private final DescriptionRepository descriptionRepository;
    private final QuizRepository quizRepository;
    private final QuizOptionRepository quizOptionRepository;
    private final AlarmCombRepository alarmCombRepository;
    private final CombinationRepository combinationRepository;

    /**
     * OCR + (임시 LLM 하드코딩) 처리:
     * - OCR: 약품명/투약량/전체복용횟수/일수 파싱 → user_medicine / user_medicine_item / cycle 저장
     * - LLM(하드코딩): category, description(2건), quiz(2문항; 보기 "1번"~"4번", 정답 랜덤)
     * - acno: 1일 복용 횟수 → (전체횟수 ÷ 일수) 환산 후 모드값으로 1~4 정규화하여 매핑 (1→1, 2→6, 3→11, 4→15)
     * 주의: user_medicine_table의 NOT NULL 컬럼(category, created_at 등)은 최초 INSERT 전에 채운다.
     */
    @Transactional
    public Long createFromImage(Long uno, String imagePath) {
        // 0) 사용자 확인
        userRepository.findById(uno)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        // 1) (모킹) OCR 결과 - 약품명 및 (투약량, 전체복용횟수, 일수)로 교체
        ExtractedPrescription ext = mockExtractedFromOCR(imagePath);

        // 2) 1일 복용 횟수 산정:
        //    각 항목에 대해 perDay = round(totalCount / days) (days가 0이면 1로 간주) → 1~4 클램프
        //    여러 약이 있을 경우 perDay의 "모드"를 선택(동률이면 큰 값 우선)
        int perDayCount = resolvePerDayCountFromTotals(ext.items());
        long acno = mapDailyCountToAcno(perDayCount);

        // 3) user_medicine INSERT (NOT NULL 컬럼 채우기)
        Timestamp now = Timestamp.from(Instant.now());
        String initialCategory = "미분류";

        UserMedicineEntity um = new UserMedicineEntity();
        um.getUser().setUno(uno);
        um.getAlarmComb().setAcno(acno);
        um.setHospital(ext.hospital());
        um.setCategory(initialCategory);   // NOT NULL 방지
        um.setTaken(0);
        um.setCreatedAt(now());             // created_at 세팅

        userMedicineRepository.save(um);   // umno 발급

        // 4) user_medicine_item INSERT (신규 생성 금지: 마스터에 없으면 예외)
        for (ExtractedItem it : ext.items()) {
            Long mdno = requireMedicine(it.name());
            UserMedicineItemEntity umi = new UserMedicineItemEntity();
            umi.getUserMedicine().setUmno(um.getUmno());
            umi.getMedicine().setMdno(mdno);
            umi.setDescription("각 약품설명(복약안내, 주의사항)");
            userMedicineItemRepository.save(umi);
        }

        // 5) cycle INSERT
        // - 아이템 간 합산 금지.
        // - 대표 totalCount(여기서는 최댓값) × 대표 days(최댓값) 으로 total_cycle 산출.
        //   예: A(1,6,3), B(1,6,3), C(1,3,3) → repTotal=6, repDays=3 → total_cycle = 6*3 = 18
        int repTotal = 0;
        int repDays  = 0;

        for (ExtractedItem it : ext.items()) {
            repTotal = Math.max(repTotal, Math.max(0, it.countTotal()));
            repDays  = Math.max(repDays,  Math.max(1, it.days()));
        }

        LocalDate today = LocalDate.now();
        CycleEntity cycle = new CycleEntity();
        cycle.getUserMedicine().setUmno(um.getUmno());
        cycle.setTotalCycle(safeMul(repTotal, repDays));
        cycle.setCurCycle(0);
        cycle.setSaveCycle(0);
        cycle.setStartDate(Date.valueOf(today).toLocalDate());
        cycle.setEndDate(Date.valueOf(today.plusDays(repDays - 1)).toLocalDate());
        cycleRepository.save(cycle);

        // 6) (하드코딩) LLM 결과 반영: category / description / quiz
        applyLlmForMedicationInternal(um.getUmno());

        return um.getUmno();
    }

    /** 마스터 테이블 고정: 이름으로 조회, 존재하지 않으면 즉시 예외 (신규 생성 금지) */
    private Long requireMedicine(String rawName) {
        String key = normalizeName(rawName);
        return medicineRepository.findByName(key)
                .map(MedicineEntity::getMdno)
                .orElseThrow(() ->
                        new IllegalStateException("의약품 마스터에 존재하지 않는 약품명입니다: " + key));
    }

    /** 간단 정규화(앞뒤 공백 제거, 다중 공백 1칸) — 필요 시 매핑 테이블로 확장 */
    private String normalizeName(String s) {
        if (s == null) return "";
        return s.trim().replaceAll("\\s+", " ");
    }

    /** 여러 약의 perDay(= round(totalCount / days))의 모드 선택. 동률이면 큰 값 우선. 1~4로 클램프. */
    private int resolvePerDayCountFromTotals(List<ExtractedItem> items) {
        Map<Integer, Integer> freq = new HashMap<>();
        for (ExtractedItem it : items) {
            int days = Math.max(1, it.days());
            int perDay = (int) Math.round((double) it.countTotal() / days);
            perDay = clamp(perDay, 1, 4);
            freq.merge(perDay, 1, Integer::sum);
        }
        int best = 1;
        int bestCnt = -1;
        for (Map.Entry<Integer, Integer> e : freq.entrySet()) {
            int v = e.getKey();
            int c = e.getValue();
            if (c > bestCnt || (c == bestCnt && v > best)) {
                best = v;
                bestCnt = c;
            }
        }
        return best;
    }

    /** acno 매핑: 1→1, 2→6, 3→11, 4→15 */
    private long mapDailyCountToAcno(int perDayCount) {
        int v = clamp(perDayCount, 1, 4);
        return switch (v) {
            case 1 -> 1L;   // 아침
            case 2 -> 6L;   // 아침, 저녁
            case 3 -> 11L;  // 아침, 점심, 저녁
            case 4 -> 15L;  // 아침, 점심, 저녁, 취침전
            default -> 11L; // 방어값(3회)
        };
    }

    private int clamp(int v, int lo, int hi) {
        return Math.max(lo, Math.min(hi, v));
    }

    private final EventNameRepository eventNameRepository;

    private Long requireEnno(String eventName) {
        return eventNameRepository.findByName(eventName)
                .map(EventNameEntity::getEnno)
                .orElseThrow(() -> new IllegalStateException(
                        "event_name_table에 존재하지 않는 이벤트명: " + eventName));
    }

    /** 카테고리/스크립트/퀴즈(정답 랜덤) 하드코딩 적용 */
    private static final long ENNO_ALARM = 1L;
    private static final long ENNO_CALL  = 3L;

    private void applyLlmForMedicationInternal(Long umno) {
        UserMedicineEntity um = Optional.ofNullable(userMedicineRepository.findByUmno(umno))
                .orElseThrow(() -> new IllegalArgumentException("처방 정보를 찾을 수 없습니다."));
        um.setCategory("약 카테고리 예시");
        userMedicineRepository.save(um);

        Timestamp now = Timestamp.from(Instant.now());

        // --- alarm ---
        DescriptionEntity alarm = new DescriptionEntity();
        alarm.getUserMedicine().setUmno(umno);
        alarm.getEventName().setEnno(ENNO_ALARM);
        alarm.setDescription("복약알림예시스크립트입니다.");
        alarm.setCreatedAt(now.toLocalDateTime());
        descriptionRepository.save(alarm);

        // --- call ---
        DescriptionEntity call = new DescriptionEntity();
        call.getUserMedicine().setUmno(umno);
        call.getEventName().setEnno(ENNO_CALL);
        call.setDescription("AI전화알림예시스크립트입니다.");
        call.setCreatedAt(now.toLocalDateTime());
        descriptionRepository.save(call);

        // 퀴즈 생성 로직은 그대로
        createQuizWithRandomAnswer(umno, "‘감기약’을 복용할 때 병용섭취를 주의해야하는 원료는?");
        createQuizWithRandomAnswer(umno, "‘감기약’에 포함된 약품의 효능은?");
    }

    // 상수 (클래스 필드 영역에 추가)
    private static final String Q_DRUG_INTERACTION =
            "‘감기약’을 복용할 때 병용섭취를 주의해야하는 원료는?";
    private static final String Q_EFFICACY =
            "‘감기약’에 포함된 약품의 효능은?";

    /** quiz question → type 매핑 (두 가지만 허용) */
    private String resolveQuizTypeStrict(String question) {
        if (Q_DRUG_INTERACTION.equals(question)) return "병용주의";
        if (Q_EFFICACY.equals(question))        return "약효분류";
        // ‘기타’ 금지: 예상치 못한 문구면 즉시 실패
        throw new IllegalArgumentException("지원하지 않는 quiz question: " + question);
    }

    /** 보기 "1번"~"4번" 생성, 하나만 랜덤 정답 */
    private void createQuizWithRandomAnswer(Long umno, String question) {
        QuizEntity quiz = new QuizEntity();
        quiz.getUserMedicine().setUmno(umno);
        quiz.setQuestion(question);
        quiz.setType(resolveQuizTypeStrict(question));
        quizRepository.save(quiz);

        List<String> options = List.of("1번", "2번", "3번", "4번");
        int correctIndex = new Random().nextInt(options.size());

        for (int i = 0; i < options.size(); i++) {
            QuizOptionEntity opt = new QuizOptionEntity();
            opt.getQuiz().setQno(quiz.getQno());
            opt.setContent(options.get(i));
            opt.setIsCorrect(i == correctIndex);
            quizOptionRepository.save(opt);
        }
    }

    // --- OCR 모킹 DTO ---
    private record ExtractedPrescription(String hospital, List<ExtractedItem> items) {}
    /**
     * dosagePerIntake: 1회 투약량
     * countTotal: 전체 복용횟수(기간 전체)
     * days: 복용 일수
     */
    private record ExtractedItem(String name, int dosagePerIntake, int countTotal, int days) {}

    private ExtractedPrescription mockExtractedFromOCR(String imagePath) {
        return new ExtractedPrescription(
                "하늘병원",
                List.of(
                        // (1정 × 전체 6회 × 3일) → perDay ≈ 2 → acno = 6
                        new ExtractedItem("씨프로바이정250mg", 1, 6, 3),
                        new ExtractedItem("화록소정",          1, 6, 3)
                )
        );
    }

    /** 오버플로/음수 방지 곱셈 */
    private int safeMul(int a, int b) {
        long v = (long) a * (long) b;
        if (v > Integer.MAX_VALUE) return Integer.MAX_VALUE;
        if (v < 0) return 0;
        return (int) v;
    }

    @Transactional
    public MedicationCategoryUpdateResponseDTO updateMedicationCategory(
            Long uno, Long umno, MedicationCategoryUpdateRequestDTO request) {

        String newCategory = request.getCategory();
        if (!StringUtils.hasText(newCategory)) {
            throw new IllegalArgumentException("카테고리는 비어 있을 수 없습니다.");
        }
        newCategory = newCategory.trim();
        if (newCategory.length() > 20) {
            throw new IllegalArgumentException("카테고리는 20자 이하여야 합니다.");
        }

        UserMedicineEntity ume = userMedicineRepository.findByUmnoAndUser_Uno(umno, uno);
        if (ume == null) {
            throw new IllegalArgumentException("해당 사용자의 복약 정보(umno=" + umno + ")를 찾을 수 없습니다.");
        }

        ume.setCategory(newCategory);

        return new MedicationCategoryUpdateResponseDTO(
                ume.getUser().getUno(),
                ume.getUmno(),
                ume.getCategory()
        );
    }

    /**
     * 상세 복약 정보 조회
     * - 소유자(uno) 검증
     * - comb: AlarmCombEntity의 활성 카운트 → "1일 N회"
     * - 각 약에 대해:
     *    - medicine_table: mdno, name, classification, image, information
     *    - user_medicine_item_table: description (LLM 생성 X, DB 그대로)
     *    - combination_table: ingredient가 NULL이 아닌 행만 대상으로
     *        "약 이름 vs ingredient" 부분 일치 시 material 수집(중복 제거)
     */
    @Transactional(readOnly = true)
    public MedicationDetailResponseDTO getMedicationDetail(Long uno, Long umno) {

        // 복약 엔터티 조회
        UserMedicineEntity userMedicine = userMedicineRepository.findByUmno(umno);
        if (userMedicine == null || !Objects.equals(userMedicine.getUser().getUno(), uno)) {
            throw new IllegalArgumentException("해당 복약 정보가 존재하지 않거나 접근 권한이 없습니다.");
        }

        // 복약에 포함된 약 리스트 조회
        List<UserMedicineItemEntity> items = userMedicineItemRepository.findAllByUserMedicine_Umno(umno);

        // 3comb 계산 (예: "breakfast,lunch")
        AlarmCombEntity combEntity = userMedicine.getAlarmComb();

        List<String> combList = new ArrayList<>();
        if (Boolean.TRUE.equals(combEntity.getBreakfast())) combList.add("breakfast");
        if (Boolean.TRUE.equals(combEntity.getLunch())) combList.add("lunch");
        if (Boolean.TRUE.equals(combEntity.getDinner())) combList.add("dinner");
        if (Boolean.TRUE.equals(combEntity.getNight())) combList.add("night");
        String comb = String.join(",", combList);

        // medicine + materials 매핑
        List<MedicationDetailMedicineDTO> medicines = items.stream().map(item -> {
            MedicineEntity med = item.getMedicine();

            // information = medicine_table.description
            String information = med.getDescription();

            // description = user_medicine_item_table.description
            String description = item.getDescription();

            // 병용주의 원료(materials) 조회
            String medNameNorm = normalizeKR(med.getName());
            List<MaterialDTO> materials = combinationRepository.findAll().stream()
                    .filter(c -> nameMatches(medNameNorm, c.getIngredient()) ||
                            nameMatches(medNameNorm, c.getName()))
                    .map(CombinationEntity::getMaterial)
                    .filter(Objects::nonNull)
                    .distinct()
                    .map(m -> new MaterialDTO(m.getMtno(), m.getName()))
                    .collect(Collectors.toList());

            return new MedicationDetailMedicineDTO(
                    med.getMdno(),
                    med.getName(),
                    med.getClassification(),
                    med.getImage(),
                    information,   // ← medicine_table.description
                    description,   // ← user_medicine_item_table.description
                    materials
            );
        }).collect(Collectors.toList());

        // 최종 DTO 반환
        return new MedicationDetailResponseDTO(
                userMedicine.getUmno(),
                userMedicine.getHospital(),
                userMedicine.getCategory(),
                userMedicine.getTaken(),
                comb,
                medicines
        );
    }

    // ==========================
    // 🔹 문자열 정규화/매칭 유틸
    // ==========================

    /** 한글/영문/숫자만 남기고 공백·기호 제거, 정규화(NFKC), 소문자 */
    private String normalizeKR(String s) {
        if (s == null) return "";
        String n = Normalizer.normalize(s, Normalizer.Form.NFKC).toLowerCase(Locale.ROOT);
        return n.replaceAll("[^\\p{IsLetter}\\p{IsDigit}]", "");
    }

    /** 부분 일치 규칙: ingredient != null && (medName.contains(ingredient) || ingredient.contains(medName)) */
    private boolean nameMatches(String medNameNorm, String ingredientRaw) {
        if (ingredientRaw == null) return false;
        String ing = normalizeKR(ingredientRaw);
        if (ing.isEmpty() || medNameNorm.isEmpty()) return false;
        return medNameNorm.contains(ing) || ing.contains(medNameNorm);
    }
}
