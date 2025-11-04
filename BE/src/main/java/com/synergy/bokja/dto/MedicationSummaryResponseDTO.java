package com.synergy.bokja.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicationSummaryResponseDTO {
    private String hospital;
    private String category;
    private List<MedicationItemDTO> medicines;
}
