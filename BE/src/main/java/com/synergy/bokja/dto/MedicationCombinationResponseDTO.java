package com.synergy.bokja.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MedicationCombinationResponseDTO {
    private Long umno;
    private int breakfast;
    private int lunch;
    private int dinner;
    private int night;
}