package com.synergy.bokja.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MedicationTimeItemDTO {
    private Long uno;
    private Long atno;
    private Long umno;
    private String type;
    private int time;
}