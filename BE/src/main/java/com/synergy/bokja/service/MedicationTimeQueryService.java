package com.synergy.bokja.service;

import com.synergy.bokja.dto.MedicationTimeItemDTO;
import com.synergy.bokja.entity.*;
import com.synergy.bokja.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
@RequiredArgsConstructor
public class MedicationTimeQueryService {

    private final UserMedicineRepository userMedicineRepository;
    private final UserTimeRepository userTimeRepository;

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

        // 3) 사용자 복약 시간 조회
        UserTimeEntity userTime = userTimeRepository
                .findByUser_UnoAndTime_Type(uno, type)
                .orElseThrow(() ->
                        new IllegalArgumentException("해당 사용자의 " + type + " 시간 설정을 찾을 수 없습니다.")
                );

        // 4) DTO 구성
        return new MedicationTimeItemDTO(
                uno,
                userTime.getUtno(),  // atno
                umno,
                type,
                userTime.getTime().getTime().getHour()
        );
    }
}
