package com.synergy.bokja.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class MedicationTimeUpdateRequestDTO {
    private String type;
    private int time;
}
