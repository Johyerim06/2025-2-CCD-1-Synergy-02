package com.synergy.bokja.dto;

import lombok.Getter;
import java.util.List;

@Getter
public class ConditionCreateRequestDTO {
    private List<Long> effects; // efno 리스트
}
