package com.synergy.bokja.service;

import com.synergy.bokja.dto.*;
import com.synergy.bokja.entity.*;
import com.synergy.bokja.repository.*;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;

import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {

    private final DescriptionRepository descriptionRepository;
    private final EventRepository eventRepository;
    private final UserMedicineRepository userMedicineRepository;
    private final EventNameRepository eventNameRepository;
    private final AlarmTimeRepository alarmTimeRepository;
    private final QuizRepository quizRepository;
    private final QuizOptionRepository quizOptionRepository;
    private final CycleRepository cycleRepository;
    private final TtsService ttsService;
    private final UserRepository userRepository;
    private final FcmService fcmService;

    public AIScriptResponseDTO getAIScript(Long umno) {
        DescriptionEntity description = descriptionRepository.findByUserMedicine_UmnoAndEventName_Enno(umno, 3l); // AI call -> enno : 3

        if (description == null) {
            throw new IllegalArgumentException("해당 복약 정보(umno=" + umno + ")와 이벤트(enno=3)에 대한 description을 찾을 수 없습니다.");
        }

        String descriptionText = description.getDescription();
        if (descriptionText == null || descriptionText.trim().isEmpty()) {
            throw new IllegalArgumentException("description이 비어있습니다.");
        }

        // TTS 생성 (Base64 문자열 반환)
        String audioUrl = ttsService.generateTtsFromText(descriptionText);

        AIScriptResponseDTO dto = new AIScriptResponseDTO(
                description.getUserMedicine().getUmno(),
                descriptionText,
                audioUrl
        );
        
        return dto;
    }

    @Transactional
    public updateEventStatusResponseDTO updateEventStatus(Long eno) {

        EventEntity event = eventRepository.findById(eno)
                .orElseThrow(() -> new IllegalArgumentException("해당 이벤트를 찾을 수 없습니다. eno: " + eno));

        event.setStatus(EventStatus.완료);
        event.setUpdatedAt(LocalDateTime.now());

        try {
            Long umnoToFind = event.getUserMedicine().getUmno();

            CycleEntity cycle = cycleRepository.findByUserMedicine_Umno(umnoToFind)
                    .orElseThrow(() -> new NullPointerException("Cycle not found for umno: " + umnoToFind));

            int currentSaveCycle = (cycle.getSaveCycle() != null) ? cycle.getSaveCycle() : 0;
            cycle.setSaveCycle(currentSaveCycle + 1);

        } catch (NullPointerException e) {
            System.out.println("Cycle 정보를 찾는 데 실패했습니다. " + e.getMessage());
        }

        return new updateEventStatusResponseDTO(event.getEno());
    }

    /**
     * [배치 작업] 1. 매일 00시에 호출될 메인 메서드
     */
    @Transactional
    public void createAndSendDailyEvents() {
        List<UserEntity> activeUsers = userRepository.findAllByIsActive(true);

        for (UserEntity user : activeUsers) {
            try {
                // 1. 유저의 "오늘 날짜" 이벤트 생성
                List<EventEntity> newEvents = generateEventsForUser(user);

                if (newEvents.isEmpty()) continue;

                // 2. DB에 일괄 저장
                eventRepository.saveAll(newEvents);

                // 3. 저장한 이벤트로 DTO 생성
                EventItemResponseDTO fcmPayload = buildEventResponseDTO(user.getUno(), newEvents);

                // 4. FCM으로 전송
//                 fcmService.sendEvents(user.getFcmToken(), fcmPayload);

            } catch (Exception e) {
                System.err.println("Error generating events for user " + user.getUno() + ": " + e.getMessage());
            }
        }
    }

    /**
     * [배치 작업] 2. 퀴즈를 랜덤 선택하여 EventEntity 리스트를 생성 (DB 저장 전)
     */
    private List<EventEntity> generateEventsForUser(UserEntity user) {
        LocalDate today = LocalDate.now();
        List<EventEntity> newEvents = new ArrayList<>();

        // --- (N+1 방지 로직 1) 오늘 먹을 약 필터링 ---
        List<UserMedicineEntity> allMeds = userMedicineRepository.findAllByUser_Uno(user.getUno());
        List<Long> umnoList = allMeds.stream().map(UserMedicineEntity::getUmno).collect(Collectors.toList());
        if (umnoList.isEmpty()) return newEvents; // 복약 정보 없음

        Map<Long, CycleEntity> cycleMap = cycleRepository.findAllByUserMedicine_UmnoIn(umnoList).stream()
                .collect(Collectors.toMap(c -> c.getUserMedicine().getUmno(), c -> c));

        List<UserMedicineEntity> activeMedsToday = allMeds.stream()
                .filter(med -> {
                    CycleEntity cycle = cycleMap.get(med.getUmno());
                    if (cycle == null) return false;
                    LocalDate start = cycle.getStartDate();
                    LocalDate end = cycle.getEndDate();
                    return (today.isEqual(start) || today.isAfter(start)) &&
                            (today.isEqual(end) || today.isBefore(end));
                })
                .toList();

        if (activeMedsToday.isEmpty()) return newEvents; // 오늘 먹을 약 없음

        List<Long> activeUmnoList = activeMedsToday.stream()
                .map(UserMedicineEntity::getUmno)
                .collect(Collectors.toList());

        List<AlarmTimeEntity> alarmTimes = alarmTimeRepository.findAllByUserMedicine_UmnoIn(activeUmnoList);

        EventNameEntity alarmEventName = eventNameRepository.findById(1L)
                .orElseThrow(() -> new RuntimeException("enno=1인 '알림' 이벤트명을 찾을 수 없습니다.")); // (배치 실패 처리)

        Map<Long, List<QuizEntity>> quizMap = quizRepository.findAllByUserMedicine_UmnoIn(activeUmnoList)
                .stream()
                .collect(Collectors.groupingBy(q -> q.getUserMedicine().getUmno()));

        Random random = new Random();
        Map<Long, DescriptionEntity> descriptionMap = new HashMap<>();

        for (UserMedicineEntity med : activeMedsToday) {

            // 동적 설명 생성
            String category = med.getCategory();
            String dynamicDescription = String.format("%s약 먹을 시간이에요! 아래 퀴즈를 풀어주세요", category);

            DescriptionEntity newDescription = DescriptionEntity.builder()
                    .userMedicine(med)
                    .eventName(alarmEventName)
                    .description(dynamicDescription)
                    .createdAt(LocalDateTime.now())
                    .build();
            DescriptionEntity savedDescription = descriptionRepository.save(newDescription);

            // Map에 저장 (Key: umno, Value: 저장된 엔티티)
            descriptionMap.put(med.getUmno(), savedDescription);
        }

        Map<Long, Integer> eventCountPerUmno = new HashMap<>();

        for (AlarmTimeEntity alarm : alarmTimes) {
            Long currentUmno = alarm.getUserMedicine().getUmno();

            // 퀴즈 랜덤 선택
            QuizEntity selectedQuiz = null;
            List<QuizEntity> quizzesForThisUmno = quizMap.get(currentUmno);
            if (quizzesForThisUmno != null && !quizzesForThisUmno.isEmpty()) {
                selectedQuiz = quizzesForThisUmno.get(random.nextInt(quizzesForThisUmno.size()));
            }

            EventEntity newEvent = EventEntity.builder()
                    .userMedicine(alarm.getUserMedicine())
                    .alarmTime(alarm)
                    .eventName(alarmEventName)
                    .description(descriptionMap.get(currentUmno))
                    .quiz(selectedQuiz)
                    .status(EventStatus.발행)
                    .createdAt(LocalDateTime.now())
                    .build();

            newEvents.add(newEvent);

            eventCountPerUmno.put(currentUmno, eventCountPerUmno.getOrDefault(currentUmno, 0) + 1);
        }

        for (Map.Entry<Long, Integer> entry : eventCountPerUmno.entrySet()) {
            Long umno = entry.getKey();
            Integer newEventCount = entry.getValue(); // 오늘 생성된 이벤트 갯수

            CycleEntity cycleToUpdate = cycleMap.get(umno); // (N+1 방지) 이미 로드한 객체 재사용
            if (cycleToUpdate != null) {
                int currentCycle = (cycleToUpdate.getCurCycle() != null) ? cycleToUpdate.getCurCycle() : 0;
                cycleToUpdate.setCurCycle(currentCycle + newEventCount);
            }
        }

        return newEvents;
    }

    /**
     * [API] 1. '오늘의 이벤트' 목록 조회 (백업용)
     */
    public EventItemResponseDTO getEventList(Long uno) {

        // 1. 오늘 날짜의 범위 계산 (00:00:00 ~ 23:59:59.999999999)
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);

        // 2. (수정) 날짜 범위 조건을 포함하여 조회
        List<EventEntity> events = eventRepository.findAllByUserMedicine_User_UnoAndStatusAndCreatedAtBetween(
                uno,
                EventStatus.발행,
                startOfDay,
                endOfDay
        );

        if (events.isEmpty()) {
            return new EventItemResponseDTO(uno, new ArrayList<>());
        }

        // 3. 공통 DTO 빌더를 호출하여 반환 (기존 동일)
        return buildEventResponseDTO(uno, events);
    }

    /**
     * [공통 헬퍼] 1. EventEntity 목록을 받아서 최종 DTO(FCM/API 응답용)로 만듦
     */
    private EventItemResponseDTO buildEventResponseDTO(Long uno, List<EventEntity> events) {
        // (N+1 방지) 퀴즈 옵션 미리 조회 (기존과 동일)
        List<Long> qnoList = events.stream()
                .map(EventEntity::getQuiz)
                .filter(Objects::nonNull)
                .map(QuizEntity::getQno)
                .distinct()
                .collect(Collectors.toList());

        Map<Long, List<QuizOptionEntity>> optionsMap =
                quizOptionRepository.findAllByQuiz_QnoIn(qnoList).stream()
                        .collect(Collectors.groupingBy(opt -> opt.getQuiz().getQno()));

        List<EventItemDTO> eventListDTOs = events.stream().map(event -> {

            UserMedicineEntity med = event.getUserMedicine();
            // (Event -> AlarmTime -> Time -> LocalTime)
            LocalDateTime time = event.getCreatedAt().toLocalDate().atTime(event.getAlarmTime().getTime().getTime());

            QuizEntity selectedQuiz = event.getQuiz();
            String question = null;
            CandidateDTO candidate = null;

            if (selectedQuiz != null) {
                question = selectedQuiz.getQuestion();

                // 퀴즈 옵션 조합
                List<QuizOptionEntity> options = optionsMap.getOrDefault(selectedQuiz.getQno(), new ArrayList<>());

                // 정답 리스트
                List<String> correctAnswers = options.stream()
                        .filter(QuizOptionEntity::getIsCorrect)
                        .map(QuizOptionEntity::getContent)
                        .collect(Collectors.toList());

                // 오답 리스트
                List<String> wrongAnswers = options.stream()
                        .filter(o -> !o.getIsCorrect())
                        .map(QuizOptionEntity::getContent)
                        .collect(Collectors.toList());

                // 셔플 및 DTO 생성
                Collections.shuffle(wrongAnswers);

                if (!correctAnswers.isEmpty()) {
                    candidate = new CandidateDTO(
                            correctAnswers.get(0), // 정답 1개
                            wrongAnswers.stream().limit(3).collect(Collectors.toList()) // 오답 3개
                    );
                }
            }

            return new EventItemDTO(
                    event.getEno(), med.getUmno(), event.getEventName().getName(), time,
                    med.getHospital(), med.getCategory(),
                    (event.getDescription() != null) ? event.getDescription().getDescription() : "",
                    question, candidate
            );
        }).collect(Collectors.toList());

        return new EventItemResponseDTO(uno, eventListDTOs);

    }
}
