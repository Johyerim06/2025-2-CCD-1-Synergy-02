package com.synergy.bokja.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.util.List;

@Getter
@AllArgsConstructor
public class MedicationDetailResponseDTO {
    private Long umno;
    private String hospital;
    private String category;
    private int taken;
    private String comb; // "1일 N회"
    private List<MedicationDetailMedicineDTO> medicines;
}
