package com.synergy.bokja.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserTodayMedicationResponseDTO {
    private List<UserTodayMedicationDTO> medications;
}
