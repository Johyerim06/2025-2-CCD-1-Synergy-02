package com.synergy.bokja.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.synergy.bokja.dto.MedicationCreateResponseDTO;
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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicationService2 {

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

    private final ObjectMapper objectMapper;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("${python.script.ocr}")
    private String ocrScriptPath;

    @Value("${python.script.llm}")
    private String llmScriptPath;

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

                // --- Python OCR 스크립트 실행 (ProcessBuilder) ---
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
            case 3: acno = 26L; break;
            case 4: acno = 30L; break;
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
        // 1. (동일) 주의사항 리스트 준비
        List<String> warnings = allCombinations.stream()
                .filter(c ->
                        (c.getName() != null && c.getName().equals(med.getName())) ||
                                (c.getClassification() != null && c.getClassification().equals(med.getClassification())) ||
                                (c.getIngredient() != null && med.getIngredient() != null && med.getIngredient().contains(c.getIngredient()))
                )
                .map(CombinationEntity::getInformation)
                .distinct()
                .collect(Collectors.toList());

        // 2. (수정) Python 스크립트 호출 (인자 4개 전달)
        String llmResult = runPythonScript(llmScriptPath,
                "description", // sys.argv[1] (mode)
                med.getInformation(), // sys.argv[2]
                med.getDescription(), // sys.argv[3]
                objectMapper.writeValueAsString(warnings) // sys.argv[4]
        );

        // 3. (수정) LLM 결과(JSON 문자열) 파싱
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
        // (combination_table의 ingredient 컬럼이 '주의 원료'라고 가정)
        List<String> correctAnswers = combinations.stream()
                .map(CombinationEntity::getIngredient)
                .filter(Objects::nonNull) // null이 아닌 것만
                .distinct() // 중복 제거
                .collect(Collectors.toList());

        // 2. 님의 조건: "정답이 없을 수도 있ㄱ든 그러면 그냥 생성하지 말고"
        if (correctAnswers.isEmpty()) {
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
                .question(String.format("%s에 포함되어있지 않은 효능은?", category))
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

}
