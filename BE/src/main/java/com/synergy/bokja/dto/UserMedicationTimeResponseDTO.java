package com.synergy.bokja.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserMedicationTimeResponseDTO {
    private Long utno;
    private Long uno;
    private Long tno;
}
