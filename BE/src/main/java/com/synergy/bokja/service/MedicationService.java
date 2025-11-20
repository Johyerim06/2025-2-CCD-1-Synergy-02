package com.synergy.bokja.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.synergy.bokja.dto.*;
import com.synergy.bokja.dto.ocr.*;
import com.synergy.bokja.entity.*;
import com.synergy.bokja.repository.*;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.Normalizer;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

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
    private final MaterialRepository materialRepository;
    private final EventNameRepository eventNameRepository;
    private final AlarmTimeRepository alarmTimeRepository;
    private final UserTimeRepository userTimeRepository;
    private final TimeRepository timeRepository;
    private final ReportRepository reportRepository;

    private final ObjectMapper objectMapper;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("${python.script.ocr}")
    private String ocrScriptPath;

    @Value("${python.script.llm}")
    private String llmScriptPath;

    /**
     * 1. 새 복약 정보 등록(이미지 업로드)
     */
    @Transactional
    public MedicationCreateResponseDTO uploadImg(Long uno, String mode, MultipartFile imageFile) {

        ParsedPrescriptionData parsedData = null;
        File tempFile = null;

        try {
            // --- MultipartFile을 임시 파일로 저장 ---
            tempFile = saveTempFile(imageFile);
            String imagePath = tempFile.getAbsolutePath();

            if(mode.equals("1")){
                // 처방전 ocr

                // --- 1. 처방전 ocr ---
                String ocrJsonResult = runPythonScript(ocrScriptPath, imagePath, mode);
                System.out.println("OCR Result (Mode 1): " + ocrJsonResult);

                // --- 2. (수정) OCR 결과(JSON) 파싱 ---
                IncizorResponse docResponse = objectMapper.readValue(ocrJsonResult, IncizorResponse.class);

                // --- 3. (추가) 공통 DTO로 변환 ---
                parsedData = parseIncizorResult(docResponse);

            } else if (mode.equals("2")) {
                // 약봉투 ocr

                // --- Python OCR 스크립트를 실행 (ProcessBuilder) ---
                String ocrJsonResult = runPythonScript(ocrScriptPath, imagePath, mode);
                System.out.println("OCR Result (Mode 2): " + ocrJsonResult);

                // --- OCR 결과(JSON) 파싱 ---
                OcrResponse ocrResponse = objectMapper.readValue(ocrJsonResult, OcrResponse.class);
                // --- 파싱된 객체에서 정보 추출 ---
                parsedData = parseOcrResult(ocrResponse);
            }

            if (parsedData == null) {
                throw new RuntimeException("OCR 파싱에 실패했거나 유효하지 않은 모드입니다.");
            }

            UserEntity user = userRepository.findByUno(uno);
            if (user == null) throw new IllegalArgumentException("Invalid uno");

            // === OCR 약품명 -> DB의 mdno로 매칭 ===
            List<Long> mdnos = matchMedicinesWithLLM(parsedData.getMedicines());
            List<MedicineEntity> matchedMeds = medicineRepository.findAllById(mdnos);

            // === 병용섭취 주의사항 조회 ===
            List<CombinationEntity> combinations = findCombinations(matchedMeds);

            // === 대표 카테고리 생성 ===
            String category = getRepresentativeCategory(matchedMeds);

            // === 사이클 계산 ===
            ParsedMedicineInfo primaryMed = findPrimaryMedicine(parsedData.getMedicines());
            int taken = primaryMed.getDoseCount(); // 일 복약 횟수
            int maxDoseDays = primaryMed.getDoseDays(); // 총 일수
            int totalCycle = taken * maxDoseDays;
            AlarmCombEntity alarmComb = mapTakenToAlarmComb(taken);

            // === user_medicine_table 저장 ===
            UserMedicineEntity newPrescription = UserMedicineEntity.builder()
                    .user(user)
                    .category(category)
                    .hospital(parsedData.getHospitalName())
                    .alarmComb(alarmComb)
                    .taken(taken)
                    .createdAt(LocalDateTime.now())
                    .build();
            UserMedicineEntity savedPrescription = userMedicineRepository.save(newPrescription);
            Long umno = savedPrescription.getUmno();

            // === cycle_table 저장 ===
            CycleEntity newCycle = CycleEntity.builder()
                    .userMedicine(savedPrescription) // umno FK
                    .totalCycle(totalCycle)
                    .curCycle(0)
                    .saveCycle(0)
                    .startDate(LocalDate.now())
                    .endDate(LocalDate.now().plusDays(maxDoseDays - 1))
                    .build();
            cycleRepository.save(newCycle);

            // === report_table 저장 (리포트 뼈대 생성) ===
            // - userMedicine: 이번에 생성된 복약
            // - cycle: 이번에 생성된 주기
            // - description: 아직 총평이 없으므로 빈 문자열("")로 초기화
            ReportEntity report = ReportEntity.builder()
                    .userMedicine(savedPrescription)
                    .cycle(newCycle)
                    .description("")  // nullable==false라서 null 대신 빈 문자열
                    .build();
            reportRepository.save(report);

            // === 퀴즈 생성 ===
            generateQuizzes(savedPrescription, matchedMeds, combinations, category);

            // === user_medicine_item_table 저장 ===
            List<String> finalDescriptionList = new ArrayList<>();

            for (MedicineEntity med : matchedMeds) {
                // LLM으로 최종 설명 생성
                String finalDescription = createFinalDescription(med, combinations);
                finalDescriptionList.add(finalDescription);

                UserMedicineItemEntity item = UserMedicineItemEntity.builder()
                        .userMedicine(savedPrescription) // umno FK
                        .medicine(med) // mdno FK
                        .description(finalDescription)
                        .build();
                userMedicineItemRepository.save(item);
            }

            // === description_table 저장 ===
            String fullDescription = String.join("\n", finalDescriptionList);

            EventNameEntity eventName = eventNameRepository.findById(3L)
                    .orElseThrow(() -> new IllegalArgumentException("enno=3인 EventName을 찾을 수 없습니다."));

            DescriptionEntity aiDescription = DescriptionEntity.builder()
                    .userMedicine(savedPrescription) // umno FK
                    .eventName(eventName) // enno=3 FK
                    .description(fullDescription) // 합쳐진 전체 설명
                    .createdAt(LocalDateTime.now())
                    .build();
            descriptionRepository.save(aiDescription);

            return new MedicationCreateResponseDTO(umno);

        } catch (IOException | InterruptedException e) {
            // 프로세스 실행 중 예외 처리
            throw new RuntimeException("Failed to process prescription image", e);
        } finally {
            // --- 임시 파일 삭제 ---
            if (tempFile != null && tempFile.exists()) {
                tempFile.delete();
            }
        }
    }

    /**
     * MultipartFile을 서버에 임시 파일로 저장
     */
    private File saveTempFile(MultipartFile multipartFile) throws IOException {
        String originalFileName = multipartFile.getOriginalFilename();
        String uniqueFileName = UUID.randomUUID().toString() + "_" + originalFileName;

        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        Path filePath = uploadPath.resolve(uniqueFileName);
        multipartFile.transferTo(filePath);
        return filePath.toFile();
    }

    /**
     * Python 스크립트를 실행하고 그 결과를 String(JSON)으로 반환
     */
    private String runPythonScript(String scriptPath, String... args) throws IOException, InterruptedException {
        // 1. 명령어 리스트 생성 ("python3", "script.py", "arg1", "arg2")
        List<String> command = new java.util.ArrayList<>();
        command.add("python3"); // (또는 "python")
        command.add(scriptPath);
        command.addAll(Arrays.asList(args));

        // 2. 프로세스 빌더 생성 및 시작
        ProcessBuilder pb = new ProcessBuilder(command);
        Process process = pb.start();

        // 3. Python의 print() 결과 (stdout) 읽기
        StringBuilder output = new StringBuilder();
        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream(), "UTF-8")); // UTF-8로 인코딩
        String line;
        while ((line = reader.readLine()) != null) {
            output.append(line);
        }

        // 4. 프로세스 종료 대기
        int exitCode = process.waitFor();

        // 5. 에러 처리 (Python 스크립트에서 에러가 났는지 확인)
        if (exitCode != 0) {
            BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream(), "UTF-8"));
            String errorOutput = errorReader.lines().collect(Collectors.joining("\n"));
            throw new RuntimeException("Python script exited with code " + exitCode + ". Error: " + errorOutput);
        }

        return output.toString();
    }

    private ParsedPrescriptionData parseIncizorResult(IncizorResponse docResponse) {
        try {
            // 1. 모든 카테고리/값 리스트 추출
            List<IncizorCategory> categories = docResponse.getResult().getImages().get(0).getResult().getCl();

            // 2. 병원명 찾기 (단일 값)
            String hospitalName = categories.stream()
                    .filter(c -> "의료기관 명칭".equals(c.getCategory()))
                    .findFirst()
                    .map(IncizorCategory::getValue)
                    .orElse("병원명 없음"); // (예외 처리)

            // 3. 약품 목록 파싱 (리스트)
            List<ParsedMedicineInfo> medicines = categories.stream()
                    // 3-1. "처방의약품 명칭" 카테고리만 필터링
                    .filter(c -> "처방의약품 명칭".equals(c.getCategory()))
                    .map(medCategory -> {
                        // 3-2. 약품명 추출
                        String name = medCategory.getValue();

                        // 3-3. 하위 'sub' 리스트를 Map으로 변환 (검색 편의성)
                        Map<String, String> subMap = medCategory.getSub().stream()
                                .collect(Collectors.toMap(
                                        IncizorCategory::getCategory,
                                        IncizorCategory::getValue,
                                        (a, b) -> a // 중복 키가 있으면 첫 번째 값 사용
                                ));

                        // 3-4. 횟수/일수 추출
                        int doseCount = Integer.parseInt(subMap.getOrDefault("1일 투여횟수", "0"));
                        int doseDays = Integer.parseInt(subMap.getOrDefault("총 투약일수", "0"));

                        // 3-5. 공통 DTO로 생성 (classification은 null로 둠)
                        return new ParsedMedicineInfo(name, null, doseCount, doseDays);
                    })
                    .collect(Collectors.toList());

            return new ParsedPrescriptionData(hospitalName, medicines);

        } catch (Exception e) {
            // (JSON 구조가 예상과 다르거나, 리스트가 비어있을 경우)
            throw new RuntimeException("IncizorLens OCR 파싱 중 에러 발생", e);
        }
    }

    private ParsedPrescriptionData parseOcrResult(OcrResponse ocrResponse) {
        if (ocrResponse.getImages() == null || ocrResponse.getImages().isEmpty()) {
            throw new RuntimeException("OCR 응답에 이미지가 없습니다.");
        }

        // fields를 Map<이름, 텍스트>로 변환하여 쉽게 접근
        Map<String, String> fieldMap = ocrResponse.getImages().get(0).getFields().stream()
                .collect(Collectors.toMap(OcrField::getName, OcrField::getText, (a, b) -> a));

        // 1. 병원명 추출
        String hospitalName = fieldMap.getOrDefault("병원명", "병원명 없음");

        // 2. 약품명/분류 추출 (Regex 사용)
        String medicineBlock = fieldMap.get("약품명");
        if (medicineBlock == null) throw new RuntimeException("OCR '약품명' 필드 없음");

        List<String> medNames = new ArrayList<>();
        List<String> classifications = new ArrayList<>();

        // 정규식 패턴: (모든문자)\n\[(대괄호안의문자)\]
        // (.*)         -> Group 1: 약품명
        // \n\[(.*?)\]    -> Group 2: 약효분류
        Pattern medPattern = Pattern.compile("(.*)\n\\[(.*?)\\]");
        Matcher matcher = medPattern.matcher(medicineBlock);
        while (matcher.find()) {
            medNames.add(matcher.group(1).trim()); // (예: "슈가메트서방정5/100···")
            classifications.add(matcher.group(2).trim()); // (예: "당뇨병 치료제")
        }

        // 3. 복약 횟수/일수 추출
        String doseBlock = fieldMap.get("복약 횟수");
        if (doseBlock == null) throw new RuntimeException("OCR '복약 횟수' 필드 없음");

        List<Integer> doseCounts = new ArrayList<>();
        List<Integer> doseDays = new ArrayList<>();
        String[] doseLines = doseBlock.split("\n"); // "1 6 3\n1 6 3" -> ["1 6 3", "1 6 3"]

        for (String line : doseLines) {
            String[] parts = line.trim().split("\\s+"); // 공백으로 분리 "1 6 3" -> ["1", "6", "3"]
            if (parts.length >= 3) {
                // parts[0] = 투약량 (1)
                // parts[1] = 횟수 (6)
                // parts[2] = 일수 (3)
                doseCounts.add(Integer.parseInt(parts[1]));
                doseDays.add(Integer.parseInt(parts[2]));
            }
        }

        // 4. 데이터 조합
        List<ParsedMedicineInfo> medicines = new ArrayList<>();
        int count = Math.min(medNames.size(), doseCounts.size()); // 두 리스트의 크기가 다를 경우를 대비

        for (int i = 0; i < count; i++) {
            medicines.add(new ParsedMedicineInfo(
                    medNames.get(i),
                    classifications.get(i),
                    doseCounts.get(i),
                    doseDays.get(i)
            ));
        }

        return new ParsedPrescriptionData(hospitalName, medicines);
    }

    private List<Long> matchMedicinesWithLLM(List<ParsedMedicineInfo> ocrMeds) throws IOException, InterruptedException {
        // 1. (동일) DB/OCR 약품 리스트 준비
        List<MedicineEntity> allDbMeds = medicineRepository.findAll();
        List<Map<String, Object>> dbMedList = allDbMeds.stream()
                .map(m -> {
                    Map<String, Object> map = new java.util.HashMap<>();
                    map.put("mdno", m.getMdno());
                    map.put("name", m.getName());
                    return map;
                })
                .collect(Collectors.toList());

        List<String> ocrNames = ocrMeds.stream()
                .map(ParsedMedicineInfo::getName)
                .collect(Collectors.toList());

        // 2. (수정) Python 스크립트 호출 (인자 3개 전달)
        String llmResult = runPythonScript(llmScriptPath,
                "match_meds", // sys.argv[1] (mode)
                objectMapper.writeValueAsString(ocrNames), // sys.argv[2]
                objectMapper.writeValueAsString(dbMedList) // sys.argv[3]
        );

        // 3. (동일) LLM 결과(JSON 리스트) 파싱
        return objectMapper.readValue(llmResult, new TypeReference<List<Long>>() {});
    }

    /**
     * [3단계] 약품 리스트로 병용섭취 주의사항 조회 (DB 쿼리)
     */
    private List<CombinationEntity> findCombinations(List<MedicineEntity> matchedMeds) {
        // 1. 모든 name, ingredient, classification 추출
        List<String> names = matchedMeds.stream()
                .map(MedicineEntity::getName).collect(Collectors.toList());
        List<String> classifications = matchedMeds.stream()
                .map(MedicineEntity::getClassification).distinct().collect(Collectors.toList());
        List<String> ingredients = matchedMeds.stream()
                .filter(med -> med.getIngredient() != null)
                .flatMap(med -> Arrays.stream(med.getIngredient().split(",")))
                .map(String::trim).distinct().collect(Collectors.toList());

        // 2. Repository에 쿼리 요청
        return combinationRepository.findCombinationsIn(names, ingredients, classifications);
    }

    /**
     * [4단계] 대표 카테고리 생성 (LLM)
     */
    private String getRepresentativeCategory(List<MedicineEntity> matchedMeds) throws IOException, InterruptedException {
        // 1. (동일) 분류 리스트 준비
        List<String> classifications = matchedMeds.stream()
                .map(MedicineEntity::getClassification)
                .distinct()
                .collect(Collectors.toList());

        // 2. (수정) Python 스크립트 호출 (인자 2개 전달)
        String llmResult = runPythonScript(llmScriptPath,
                "category", // sys.argv[1] (mode)
                objectMapper.writeValueAsString(classifications) // sys.argv[2]
        );

        // 3. (수정) LLM 결과(JSON 문자열) 파싱
        return objectMapper.readValue(llmResult, String.class); // "감기약" (따옴표 포함된 JSON)
    }

    /**
     * [5단계] taken(횟수) -> acno(알람조합ID) 매핑
     */
    private AlarmCombEntity mapTakenToAlarmComb(int taken) {
        Long acno;
        switch (taken) {
            case 1: acno = 1L; break;
            case 2: acno = 6L; break;
            case 3: acno = 11L; break;
            case 4: acno = 15L; break;
            default: // 4회 초과는 일단 4회(30L)로 처리
                acno = 30L;
        }
        // acno 1, 6, 26, 30은 DB에 이미 insert되어 있어야 함
        return alarmCombRepository.findById(acno)
                .orElseThrow(() -> new IllegalArgumentException("acno ID " + acno + "를 찾을 수 없습니다."));
    }

    /**
     * [8단계] 최종 복약 안내 문구 생성 (LLM)
     */
    private String createFinalDescription(MedicineEntity med, List<CombinationEntity> allCombinations) throws IOException, InterruptedException {

        // 1. 약품과 관련된 주의사항 '객체'를 필터링 (NPE 방지 코드 포함)
        List<CombinationEntity> relevantCombinations = allCombinations.stream()
                .filter(c ->
                        (c.getName() != null && c.getName().equals(med.getName())) ||
                                (c.getClassification() != null && c.getClassification().equals(med.getClassification())) ||
                                (c.getIngredient() != null && med.getIngredient() != null && med.getIngredient().contains(c.getIngredient()))
                )
                .collect(Collectors.toList());

        // 2. LLM에 보낼 '형식화된 주의사항' 리스트 생성
        List<String> formattedWarnings = relevantCombinations.stream().map(combo -> {
            // mtno가 연결된 경우
            if (combo.getMaterial() != null && combo.getMaterial().getName() != null) {
                // LLM에 "프로바이오틱스"와 "주의 문구"를 세트로 묶어서 전달
                return String.format("'%s' 관련 주의: %s", combo.getMaterial().getName(), combo.getInformation());
            } else {
                // '알코올'처럼 mtno가 없는 경우 (ingredient 기반)
                return String.format("'%s' 관련 주의: %s", combo.getIngredient(), combo.getInformation());
            }
        }).distinct().collect(Collectors.toList());

        // 3. (중요) Python 스크립트에 '인자(argument)' 4개 전달
        String llmResult = runPythonScript(llmScriptPath, "description",
                med.getInformation(),
                med.getDescription(),
                objectMapper.writeValueAsString(formattedWarnings) // ["'프로바이오틱스' 관련 주의: ..."]
        );

        return objectMapper.readValue(llmResult, String.class);
    }

    private ParsedMedicineInfo findPrimaryMedicine(List<ParsedMedicineInfo> medicines) {
        return medicines.stream()
                .max(Comparator.comparingInt(ParsedMedicineInfo::getDoseDays))
                .orElseThrow(() -> new IllegalArgumentException("약품 정보가 없습니다."));
    }

    /**
     * [8-1] 퀴즈 생성 로직 (메인)
     */
    private void generateQuizzes(UserMedicineEntity prescription, List<MedicineEntity> matchedMeds, List<CombinationEntity> combinations, String category) {

        // 1. (병용주의 퀴즈) - 조건부 생성
        generateCombinationQuiz(prescription, category, combinations);

        // 2. (약효분류 퀴즈) - 항상 생성
        generateClassificationQuiz(prescription, category, matchedMeds);
    }

    /**
     * [8-2] "병용주의" 퀴즈 생성
     */
    private void generateCombinationQuiz(UserMedicineEntity prescription, String category, List<CombinationEntity> combinations) {

        // 1. 정답 후보 (주의 원료) 추출
        List<String> correctAnswers = combinations.stream()
                .map(CombinationEntity::getMaterial) // mtno에 연결된 MaterialEntity
                .filter(Objects::nonNull) // material이 null이 아닌 것만
                .map(MaterialEntity::getName) // ex."프로바이오틱스"
                .filter(Objects::nonNull)
                .distinct()
                .collect(Collectors.toList());

        // 2. 정답이 없으면 생성하지 않음
        if (correctAnswers.isEmpty()) {
            System.out.println("병용섭취 퀴즈: 정답 후보(mtno)가 없으므로 퀴즈 생성을 건너뜁니다.");
            return; // 퀴즈 생성을 중단
        }

        // 3. quiz_table에 퀴즈 저장
        QuizEntity quiz = QuizEntity.builder()
                .userMedicine(prescription) // umno FK
                .type("병용주의")
                .question(String.format("%s를 복용할때 주의해야하는 원료는?", category))
                .build();
        QuizEntity savedQuiz = quizRepository.save(quiz);

        // 4. 오답 후보 (material_table에서 정답을 제외하고 랜덤 5개)
        List<String> wrongAnswers = materialRepository.findRandomMaterialsNotIn(correctAnswers);

        // 5. quiz_option_table에 정답/오답 저장
        saveQuizOptions(savedQuiz, correctAnswers, wrongAnswers);
    }

    /**
     * [8-3] "약효분류" 퀴즈 생성
     */
    private void generateClassificationQuiz(UserMedicineEntity prescription, String category, List<MedicineEntity> matchedMeds) {

        // 1. 정답 후보 (OCR로 뽑은 약들의 약효 분류)
        List<String> correctAnswers = matchedMeds.stream()
                .map(MedicineEntity::getClassification)
                .distinct()
                .collect(Collectors.toList());

        // (이 퀴즈는 matchedMeds가 1개 이상이므로 항상 정답이 있음)

        // 2. quiz_table에 퀴즈 저장
        QuizEntity quiz = QuizEntity.builder()
                .userMedicine(prescription) // umno FK
                .type("약효분류")
                .question(String.format("%s에 포함되어 있는 효능은?", category))
                .build();
        QuizEntity savedQuiz = quizRepository.save(quiz);

        // 3. 오답 후보 (medicine_table의 다른 classification 랜덤 5개)
        List<String> wrongAnswers = medicineRepository.findRandomClassificationsNotIn(correctAnswers);

        // 4. quiz_option_table에 정답/오답 저장
        saveQuizOptions(savedQuiz, correctAnswers, wrongAnswers);
    }

    /**
     * [8-4] 퀴즈 옵션(정답/오답)을 DB에 저장하는 공통 메서드
     */
    private void saveQuizOptions(QuizEntity quiz, List<String> correctAnswers, List<String> wrongAnswers) {

        // 1. 정답 저장 (isCorrect = true)
        for (String answer : correctAnswers) {
            QuizOptionEntity option = QuizOptionEntity.builder()
                    .quiz(quiz) // qno FK
                    .content(answer)
                    .isCorrect(true)
                    .build();
            quizOptionRepository.save(option);
        }

        // 2. 오답 저장 (isCorrect = false)
        for (String wrong : wrongAnswers) {
            QuizOptionEntity option = QuizOptionEntity.builder()
                    .quiz(quiz) // qno FK
                    .content(wrong)
                    .isCorrect(false)
                    .build();
            quizOptionRepository.save(option);
        }
    }

    /**
     * 2. 복약 알림 시간 조합 조회
     */
    @Transactional(readOnly = true)
    public MedicationCombinationResponseDTO getCombination(Long uno, Long umno) {
        UserMedicineEntity userMedicine = userMedicineRepository.findByUmno(umno);
        if (userMedicine == null ||
                userMedicine.getUser() == null ||
                !Objects.equals(userMedicine.getUser().getUno(), uno)) {
            throw new IllegalArgumentException("해당 복약 정보가 없거나 접근 권한이 없습니다.");
        }

        AlarmCombEntity alarmComb = userMedicine.getAlarmComb();
        if (alarmComb == null) {
            throw new IllegalArgumentException("AlarmCombEntity가 존재하지 않습니다. umno=" + umno);
        }

        return new MedicationCombinationResponseDTO(
                userMedicine.getUmno(),
                Boolean.TRUE.equals(alarmComb.getBreakfast()) ? 1 : 0,
                Boolean.TRUE.equals(alarmComb.getLunch())     ? 1 : 0,
                Boolean.TRUE.equals(alarmComb.getDinner())    ? 1 : 0,
                Boolean.TRUE.equals(alarmComb.getNight())     ? 1 : 0
        );
    }

    /**
     * 3. 복약 알림 시간 조합 수정
     * - alarm_time_table 반영
     * - 복용 횟수(taken)는 고정이고, 활성 타입만 변경된다는 전제
     *   (예: 아침/점심/저녁 → 점심/저녁/자기전)
     * - alarm_time_table의 atno는 그대로 유지하고, tno(TimeEntity)만 교체한다.
     */
    @Transactional
    public MedicationCombinationResponseDTO updateCombination(Long uno, Long umno, MedicationCombinationRequestDTO request) {

        // 1) 복약 엔터티 확인 + 소유자 검증
        UserMedicineEntity userMedicine = userMedicineRepository.findByUmno(umno);
        if (userMedicine == null ||
                userMedicine.getUser() == null ||
                !Objects.equals(userMedicine.getUser().getUno(), uno)) {
            throw new IllegalArgumentException("해당 복약 정보가 없거나 접근 권한이 없습니다.");
        }

        // 2) 요청 파싱 (예: "breakfast,lunch,night")
        String[] tokens = request.getCombination().split(",");
        boolean breakfast = false, lunch = false, dinner = false, night = false;

        for (String token : tokens) {
            switch (token.trim().toLowerCase()) {
                case "breakfast" -> breakfast = true;
                case "lunch"     -> lunch     = true;
                case "dinner"    -> dinner    = true;
                case "night"     -> night     = true;
            }
        }

        // 3) 활성 타입 개수와 taken(복용 횟수) 일치 여부 검증
        int newActiveCount =
                (breakfast ? 1 : 0) +
                        (lunch     ? 1 : 0) +
                        (dinner    ? 1 : 0) +
                        (night     ? 1 : 0);

        Integer taken = userMedicine.getTaken();  // 예: 3
        if (taken != null && taken > 0 && newActiveCount != taken) {
            throw new IllegalArgumentException(
                    "조합의 활성 타입 개수(" + newActiveCount + ")가 복약 횟수(" + taken + ")와 일치하지 않습니다."
            );
        }

        // 4) 해당 조합에 대응하는 AlarmCombEntity 조회
        Optional<AlarmCombEntity> combOpt = alarmCombRepository
                .findByBreakfastAndLunchAndDinnerAndNight(breakfast, lunch, dinner, night);

        if (combOpt.isEmpty()) {
            throw new IllegalArgumentException("해당 조합에 해당하는 AlarmCombEntity가 존재하지 않습니다.");
        }

        AlarmCombEntity newComb = combOpt.get();
        userMedicine.setAlarmComb(newComb);
        userMedicineRepository.save(userMedicine);

        // 5) alarm_time_table 기존 행 조회 (해당 umno)
        List<AlarmTimeEntity> existingTimes =
                alarmTimeRepository.findAllByUserMedicine_UmnoIn(Collections.singletonList(umno));

        if (existingTimes.isEmpty()) {
            throw new IllegalStateException("해당 복약 정보에 등록된 알림 시간이 없습니다. umno=" + umno);
        }

        // atno 기준으로 정렬해서 "고정된 슬롯"처럼 취급
        existingTimes.sort(Comparator.comparingLong(AlarmTimeEntity::getAtno));

        if (taken != null && taken > 0 && existingTimes.size() != taken) {
            throw new IllegalStateException(
                    "alarm_time_table 행 개수(" + existingTimes.size() + ")가 복약 횟수(" + taken + ")와 일치하지 않습니다."
            );
        }

        // 6) 새 활성 타입 리스트 (순서 고정: breakfast → lunch → dinner → night)
        List<String> newTypes = new ArrayList<>();
        if (breakfast) newTypes.add("breakfast");
        if (lunch)     newTypes.add("lunch");
        if (dinner)    newTypes.add("dinner");
        if (night)     newTypes.add("night");

        // 여기까지 왔으면 newTypes.size() == existingTimes.size() == taken 이라는 전제가 성립

        // 7) 각 슬롯(atno)에 새 타입에 맞는 시간(tno) 매핑
        for (int i = 0; i < newTypes.size(); i++) {
            String type = newTypes.get(i);
            AlarmTimeEntity alarmTime = existingTimes.get(i);

            // 사용자 기본 시간 설정(UserTime) 조회
            UserTimeEntity userTime = userTimeRepository
                    .findByUser_UnoAndTime_Type(uno, type)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "해당 사용자의 '" + type + "' 시간 설정을 찾을 수 없습니다."
                    ));

            // atno는 건드리지 않고, FK(tno)에 해당하는 TimeEntity만 교체
            alarmTime.setTime(userTime.getTime());
        }

        // 8) 변경 사항 저장 (update만 수행, delete 없음)
        alarmTimeRepository.saveAll(existingTimes);

        // 9) 응답 DTO
        return new MedicationCombinationResponseDTO(
                userMedicine.getUmno(),
                Boolean.TRUE.equals(newComb.getBreakfast()) ? 1 : 0,
                Boolean.TRUE.equals(newComb.getLunch())     ? 1 : 0,
                Boolean.TRUE.equals(newComb.getDinner())    ? 1 : 0,
                Boolean.TRUE.equals(newComb.getNight())     ? 1 : 0
        );
    }


    /**
     *  4. 복약 정보 요약 조회
     * - uno 소유 검증
     * - combination 매칭은 '포함(contains)' 기준으로만 수행
     *   (ingredient 또는 combination.name 이 의약품명에 포함될 때만 해당 material 추가)
     * - description은 user_medicine_item_table.description 그대로 사용
     */
    @Transactional(readOnly = true)
    public MedicationSummaryResponseDTO getMedicationSummary(Long uno, Long umno) {
        UserMedicineEntity um = userMedicineRepository.findByUmno(umno);
        if (um == null) throw new IllegalArgumentException("유효하지 않은 umno: " + umno);
        if (um.getUser() == null || um.getUser().getUno() == null || !um.getUser().getUno().equals(uno)) {
            throw new IllegalArgumentException("해당 복약 정보에 대한 접근 권한이 없습니다.");
        }

        List<UserMedicineItemEntity> items =
                userMedicineItemRepository.findAllByUserMedicine_Umno(umno);

        // 모든 병용주의 조합 미리 로드
        List<CombinationEntity> allCombs = combinationRepository.findAll();

        List<MedicationItemDTO> medicines = items.stream()
                .map(item -> {
                    MedicineEntity med = item.getMedicine();
                    if (med == null) return null;

                    String medNameLower = Optional.ofNullable(med.getName()).orElse("")
                            .toLowerCase(Locale.ROOT);

                    // 포함 매칭(ingredient/name)으로 material 수집 (중복 제거/순서 보존)
                    LinkedHashSet<MaterialDTO> mats = new LinkedHashSet<>();
                    for (CombinationEntity comb : allCombs) {
                        // ingredient 포함 매칭
                        String ing = Optional.ofNullable(comb.getIngredient()).orElse("").trim();
                        if (!ing.isEmpty() && medNameLower.contains(ing.toLowerCase(Locale.ROOT))) {
                            MaterialEntity m = comb.getMaterial();
                            if (m != null) mats.add(MaterialDTO.builder()
                                    .mtno(m.getMtno()).name(m.getName()).build());
                            continue; // 같은 comb에서 name 체크는 스킵
                        }
                        // combination.name 포함 매칭 (있을 때만)
                        String combName = Optional.ofNullable(comb.getName()).orElse("").trim();
                        if (!combName.isEmpty() && medNameLower.contains(combName.toLowerCase(Locale.ROOT))) {
                            MaterialEntity m = comb.getMaterial();
                            if (m != null) mats.add(MaterialDTO.builder()
                                    .mtno(m.getMtno()).name(m.getName()).build());
                        }
                    }

                    return MedicationItemDTO.builder()
                            .mdno(med.getMdno())
                            .name(med.getName())
                            .classification(med.getClassification())
                            .image(med.getImage())
                            .description(item.getDescription()) // DB값 그대로
                            .materials(new ArrayList<>(mats))
                            .build();
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        return MedicationSummaryResponseDTO.builder()
                .hospital(um.getHospital())
                .category(um.getCategory())
                .medicines(medicines)
                .build();
    }

    //한글/영문/숫자만 남기고 공백·기호 제거, 정규화(NFKC), 소문자
    private String normalizeKR(String s) {
        if (s == null) return "";
        String n = Normalizer.normalize(s, Normalizer.Form.NFKC).toLowerCase(Locale.ROOT);
        return n.replaceAll("[^\\p{IsLetter}\\p{IsDigit}]", "");
    }

    // 부분 일치 규칙: ingredient != null && (medName.contains(ingredient) || ingredient.contains(medName))
    private boolean nameMatches(String medNameNorm, String ingredientRaw) {
        if (ingredientRaw == null) return false;
        String ing = normalizeKR(ingredientRaw);
        if (ing.isEmpty() || medNameNorm.isEmpty()) return false;
        return medNameNorm.contains(ing) || ing.contains(medNameNorm);
    }

    /**
     * 5. 복약 정보 부분 수정(카테고리)
     */
    @Transactional
    public MedicationCategoryUpdateResponseDTO updateMedicationCategory(
            Long uno, Long umno, MedicationCategoryUpdateRequestDTO request) {

        String newCategory = request.getCategory();
        if (!org.springframework.util.StringUtils.hasText(newCategory)) {
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
     * 6. 복약 정보 상세 조회
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
        if (combEntity == null) {
            throw new IllegalArgumentException("해당 복약 정보에는 복약 알림 조합이 없습니다.");
        }

        List<String> combList = new ArrayList<>();
        if (Boolean.TRUE.equals(combEntity.getBreakfast())) combList.add("breakfast");
        if (Boolean.TRUE.equals(combEntity.getLunch()))     combList.add("lunch");
        if (Boolean.TRUE.equals(combEntity.getDinner()))    combList.add("dinner");
        if (Boolean.TRUE.equals(combEntity.getNight()))     combList.add("night");
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

    /**
     * 7. 개별 복약 시간 조회
     */
    @Transactional(readOnly = true)
    public MedicationTimeItemDTO getMedicationTime(Long uno, Long umno, String type) {
        // 1) 복약 정보 존재 여부 및 소유자 검증
        UserMedicineEntity ume = userMedicineRepository.findByUmno(umno);
        if (ume == null || ume.getUser() == null || !Objects.equals(ume.getUser().getUno(), uno)) {
            throw new IllegalArgumentException("해당 복약 정보가 없거나 접근 권한이 없습니다.");
        }

        // 2) comb에 포함되어 있는 타입인지 검증
        AlarmCombEntity comb = ume.getAlarmComb();
        if (comb == null) {
            throw new IllegalArgumentException("해당 복약 정보에는 복약 알림 조합이 없습니다.");
        }

        boolean valid = switch (type) {
            case "breakfast" -> Boolean.TRUE.equals(comb.getBreakfast());
            case "lunch"     -> Boolean.TRUE.equals(comb.getLunch());
            case "dinner"    -> Boolean.TRUE.equals(comb.getDinner());
            case "night"     -> Boolean.TRUE.equals(comb.getNight());
            default          -> false;
        };

        if (!valid) {
            throw new IllegalArgumentException("해당 복약 정보에는 요청한 타입의 복약 시간이 존재하지 않습니다.");
        }

        // 3) alarm_time_table 에서 해당 타입의 알람 찾기
        List<AlarmTimeEntity> alarmTimes =
                alarmTimeRepository.findAllByUserMedicine_UmnoIn(Collections.singletonList(umno));

        AlarmTimeEntity target = alarmTimes.stream()
                .filter(a -> a.getTime() != null &&
                        a.getTime().getType() != null &&
                        a.getTime().getType().equalsIgnoreCase(type))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "해당 복약 정보에는 요청한 타입의 알림 시간이 존재하지 않습니다.")
                );

        // 4) DTO 구성 (atno = AlarmTimeEntity PK)
        return new MedicationTimeItemDTO(
                uno,
                target.getAtno(),
                umno,
                type,
                target.getTime().getTime().getHour()
        );
    }

    /**
     * 8. 개별 복약 시간 수정
     * - atno: URI path 변수
     * - request: { type, time }
     */
    @Transactional
    public MedicationTimeUpdateResponseDTO updateMedicationTime(Long uno, Long umno, Long atno, MedicationTimeUpdateRequestDTO request) {

        // 1) 대상 AlarmTimeEntity 조회
        AlarmTimeEntity alarmTime = alarmTimeRepository.findById(atno)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 atno: " + atno));

        // 2) 소유권/경로 무결성 검증 (uno, umno 일치)
        if (alarmTime.getUserMedicine() == null ||
                alarmTime.getUserMedicine().getUser() == null ||
                !alarmTime.getUserMedicine().getUser().getUno().equals(uno)) {
            throw new IllegalArgumentException("해당 atno는 요청 사용자의 데이터가 아닙니다.");
        }
        if (!alarmTime.getUserMedicine().getUmno().equals(umno)) {
            throw new IllegalArgumentException("경로의 umno와 atno가 일치하지 않습니다.");
        }

        // 3) 타입 검증 (요청이 type을 보낼 경우, 기존 타입과 일치하는지 체크)
        String currentType = alarmTime.getTime().getType(); // 기존 타입
        String reqType = request.getType();
        if (reqType != null && !reqType.isBlank()) {
            if (!currentType.equalsIgnoreCase(reqType.trim())) {
                throw new IllegalArgumentException("요청 type이 기존 알림 타입과 일치하지 않습니다. (현재: "
                        + currentType + ", 요청: " + reqType + ")");
            }
        } else {
            // 프론트에서 type을 안보내면 기존 타입을 그대로 사용
            reqType = currentType;
        }

        // 4) 변경할 시간(hour)로 time_table 조회
        int newHour = request.getTime();
        if (newHour < 0 || newHour > 23) {
            throw new IllegalArgumentException("time은 0~23 사이의 정수여야 합니다.");
        }

        TimeEntity newTimeEntity = timeRepository
                .findByTypeAndTime(reqType, java.time.LocalTime.of(newHour, 0))
                .orElse(null);

        if (newTimeEntity == null) {
            throw new IllegalArgumentException(
                    "'" + reqType + "' 타입의 " + newHour + "시 설정이 time_table에 없습니다.");
        }

        // 5) 변경 적용
        alarmTime.setTime(newTimeEntity);
        alarmTimeRepository.save(alarmTime);

        // 6) 응답 DTO
        return new MedicationTimeUpdateResponseDTO(
                alarmTime.getUserMedicine().getUser().getUno(),
                alarmTime.getAtno(),
                alarmTime.getUserMedicine().getUmno(),
                newTimeEntity.getType(),
                newTimeEntity.getTime().getHour()
        );
    }
}
