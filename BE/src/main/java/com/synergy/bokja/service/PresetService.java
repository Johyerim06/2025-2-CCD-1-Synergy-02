package com.synergy.bokja.service;

import com.synergy.bokja.dto.MedicationTimePresetDTO;
import com.synergy.bokja.dto.MedicationTimePresetResponseDTO;
import com.synergy.bokja.dto.SideEffectPresetDTO;
import com.synergy.bokja.dto.SideEffectPresetResponseDTO;
import com.synergy.bokja.entity.EffectEntity;
import com.synergy.bokja.entity.TimeEntity;
import com.synergy.bokja.repository.MedicineTimePresetRepository;
import com.synergy.bokja.repository.SideEffectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PresetService {

    private final MedicineTimePresetRepository medicineTimePresetRepository;
    private final SideEffectRepository sideEffectRepository;

    public MedicationTimePresetResponseDTO getTimeList(String type) {

        List<TimeEntity> lists = medicineTimePresetRepository.findByType(type);

        List<MedicationTimePresetDTO> list = lists.stream()
                .map(MedicationTimePresetDTO::new)
                .collect(Collectors.toList());

        return new MedicationTimePresetResponseDTO(list);
    }

    public SideEffectPresetResponseDTO getEffectList() {

        List<EffectEntity> lists = sideEffectRepository.findAll();

        List<SideEffectPresetDTO> list = lists.stream()
                .map(SideEffectPresetDTO::new)
                .collect(Collectors.toList());

        return new SideEffectPresetResponseDTO(list);
    }
}
