package com.synergy.bokja.service;

import com.synergy.bokja.dto.MedicationTimeUpdateRequestDTO;
import com.synergy.bokja.dto.MedicationTimeUpdateResponseDTO;
import com.synergy.bokja.entity.AlarmTimeEntity;
import com.synergy.bokja.entity.TimeEntity;
import com.synergy.bokja.repository.AlarmTimeRepository;
import com.synergy.bokja.repository.TimeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;

@Service
@RequiredArgsConstructor
public class MedicationTimeUpdateService {

    private final AlarmTimeRepository alarmTimeRepository;
    private final TimeRepository timeRepository;

    /**
     * 개별 복약 시간 수정
     * - atno: URI path 변수
     * - request: { type, time }  (※ atno는 바디에서 제거됨)
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
            // 프론트에서 type을 안 보낼 수도 있다고 가정하면, 기존 타입을 그대로 사용
            reqType = currentType;
        }

        // 4) 변경할 시간(hour)로 time_table 조회
        int newHour = request.getTime();
        if (newHour < 0 || newHour > 23) {
            throw new IllegalArgumentException("time은 0~23 사이의 정수여야 합니다.");
        }

        TimeEntity newTimeEntity = timeRepository
                .findByTypeAndTime(reqType, LocalTime.of(newHour, 0))
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
                newTimeEntity.getType(),                 // 최종 타입(= 기존과 동일)
                newTimeEntity.getTime().getHour()        // 최종 시간
        );
    }
}
