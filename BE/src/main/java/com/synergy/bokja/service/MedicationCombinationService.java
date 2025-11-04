package com.synergy.bokja.service;

import com.synergy.bokja.dto.MedicationCombinationRequestDTO;
import com.synergy.bokja.dto.MedicationCombinationResponseDTO;
import com.synergy.bokja.entity.*;
import com.synergy.bokja.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class MedicationCombinationService {

    private final UserMedicineRepository userMedicineRepository;
    private final AlarmCombRepository alarmCombRepository;
    private final AlarmTimeRepository alarmTimeRepository;
    private final UserTimeRepository userTimeRepository;

    /**
     * 복약 알림 시간 조합 조회
     */
    public MedicationCombinationResponseDTO getCombination(Long uno, Long umno) {
        UserMedicineEntity userMedicine = userMedicineRepository.findByUmno(umno);
        if (userMedicine == null) {
            throw new IllegalArgumentException("유효하지 않은 umno: " + umno);
        }

        AlarmCombEntity alarmComb = userMedicine.getAlarmComb();
        if (alarmComb == null) {
            throw new IllegalArgumentException("AlarmCombEntity가 존재하지 않습니다. umno=" + umno);
        }

        return new MedicationCombinationResponseDTO(
                userMedicine.getUmno(),
                alarmComb.getBreakfast() ? 1 : 0,
                alarmComb.getLunch() ? 1 : 0,
                alarmComb.getDinner() ? 1 : 0,
                alarmComb.getNight() ? 1 : 0
        );
    }

    /**
     * 복약 알림 시간 조합 수정 + alarm_time_table 반영
     */
    @Transactional
    public MedicationCombinationResponseDTO updateCombination(Long uno, Long umno, MedicationCombinationRequestDTO request) {

        // 복약 엔티티 확인
        UserMedicineEntity userMedicine = userMedicineRepository.findByUmno(umno);
        if (userMedicine == null) {
            throw new IllegalArgumentException("유효하지 않은 umno: " + umno);
        }

        // 요청 파싱
        String[] tokens = request.getCombination().split(",");
        boolean breakfast = false, lunch = false, dinner = false, night = false;

        for (String token : tokens) {
            switch (token.trim().toLowerCase()) {
                case "breakfast" -> breakfast = true;
                case "lunch" -> lunch = true;
                case "dinner" -> dinner = true;
                case "night" -> night = true;
            }
        }

        // 해당 조합 존재 확인
        Optional<AlarmCombEntity> combOpt = alarmCombRepository.findByBreakfastAndLunchAndDinnerAndNight(
                breakfast, lunch, dinner, night
        );
        if (combOpt.isEmpty()) {
            throw new IllegalArgumentException("해당 조합에 해당하는 AlarmCombEntity가 존재하지 않습니다.");
        }

        // 조합 변경
        AlarmCombEntity newComb = combOpt.get();
        userMedicine.setAlarmComb(newComb);
        userMedicineRepository.save(userMedicine);

        // alarm_time_table 갱신 로직
        // 기존 데이터 삭제 후, 새로운 조합의 타입만 삽입
        List<AlarmTimeEntity> existingTimes = alarmTimeRepository.findAllByUserMedicine_UmnoIn(Collections.singletonList(umno));
        alarmTimeRepository.deleteAll(existingTimes);

        // 새로운 타입 리스트
        List<String> activeTypes = new ArrayList<>();
        if (breakfast) activeTypes.add("breakfast");
        if (lunch) activeTypes.add("lunch");
        if (dinner) activeTypes.add("dinner");
        if (night) activeTypes.add("night");

        //  각 타입별 tno 조회 및 AlarmTimeEntity 저장
        List<AlarmTimeEntity> newAlarmTimes = new ArrayList<>();
        for (String type : activeTypes) {
            UserTimeEntity userTime = userTimeRepository.findByUser_UnoAndTime_Type(uno, type)
                    .orElseThrow(() -> new IllegalArgumentException(
                            "해당 사용자의 '" + type + "' 시간 설정을 찾을 수 없습니다."
                    ));

            AlarmTimeEntity newAlarmTime = AlarmTimeEntity.builder()
                    .userMedicine(userMedicine)
                    .time(userTime.getTime())
                    .build();

            newAlarmTimes.add(newAlarmTime);
        }

        alarmTimeRepository.saveAll(newAlarmTimes);

        // 최종 응답 DTO 반환
        return new MedicationCombinationResponseDTO(
                userMedicine.getUmno(),
                newComb.getBreakfast() ? 1 : 0,
                newComb.getLunch() ? 1 : 0,
                newComb.getDinner() ? 1 : 0,
                newComb.getNight() ? 1 : 0
        );
    }
}
