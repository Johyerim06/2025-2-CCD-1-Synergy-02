package com.synergy.bokja.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class getUserMedicationTimeResponseDTO {

    private Long uno;
    private Long utno;
    private Long tno;
    private String type;
    private int time;
}
