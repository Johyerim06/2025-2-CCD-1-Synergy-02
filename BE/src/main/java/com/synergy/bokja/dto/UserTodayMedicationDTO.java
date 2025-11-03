package com.synergy.bokja.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserTodayMedicationDTO {
    private Long umno;
    private String hospital;
    private String category;
    private int taken;
    private LocalDate startAt;
}
