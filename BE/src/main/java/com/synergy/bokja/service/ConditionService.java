package com.synergy.bokja.service;

import com.synergy.bokja.dto.ConditionCreateRequestDTO;
import com.synergy.bokja.dto.ConditionCreateResponseDTO;
import com.synergy.bokja.dto.ConditionRecordItemDTO;
import com.synergy.bokja.entity.ConditionEntity;
import com.synergy.bokja.entity.EffectEntity;
import com.synergy.bokja.repository.ConditionRepository;
import com.synergy.bokja.repository.EffectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConditionService {

    private final ConditionRepository conditionRepository;
    private final EffectRepository effectRepository;

    /** 부작용 기록 등록 */
    public ConditionCreateResponseDTO createCondition(Long uno, ConditionCreateRequestDTO request) {
        Timestamp now = Timestamp.from(Instant.now());

        // 1️⃣ 전달받은 efno 리스트를 순회하면서 condition_table에 insert
        List<ConditionRecordItemDTO> effects = request.getEffects().stream().map(efno -> {
            EffectEntity effect = effectRepository.findByEfno(efno);
            if (effect == null) throw new IllegalArgumentException("유효하지 않은 efno: " + efno);

            ConditionEntity condition = ConditionEntity.builder()
                    .uno(uno)
                    .efno(efno)
                    .time(now)
                    .build();
            conditionRepository.save(condition);

            return new ConditionRecordItemDTO(effect.getEfno(), effect.getName());
        }).collect(Collectors.toList());

        // 2️⃣ 응답 body DTO 반환
        return new ConditionCreateResponseDTO(effects);
    }
}
