package com.synergy.bokja.dto;

import com.synergy.bokja.entity.EffectEntity;
import com.synergy.bokja.entity.TimeEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SideEffectPresetDTO {

    private Long efno;
    private String name;
    private String image;

    public SideEffectPresetDTO(EffectEntity entity) {
        this.efno = entity.getEfno();
        this.name = entity.getName();
        this.image = entity.getImage();
    }

}
