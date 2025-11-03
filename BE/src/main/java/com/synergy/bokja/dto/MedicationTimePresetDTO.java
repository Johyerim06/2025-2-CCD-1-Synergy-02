package com.synergy.bokja.dto;

import com.synergy.bokja.entity.TimeEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MedicationTimePresetDTO {

    private Long tno;
    private int time;

    public MedicationTimePresetDTO(TimeEntity entity) {
        this.tno = entity.getTno();
        this.time = entity.getTime().getHour();
    }

}
