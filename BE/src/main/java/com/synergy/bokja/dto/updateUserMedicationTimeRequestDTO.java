package com.synergy.bokja.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class updateUserMedicationTimeRequestDTO {

    private String type;
    private int time;
}
