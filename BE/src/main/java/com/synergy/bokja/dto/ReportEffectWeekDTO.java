package com.synergy.bokja.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.util.List;

@Getter
@AllArgsConstructor
public class ReportEffectWeekDTO {
    private int week;                               // 주차
    private List<ReportEffectItemDTO> effect_list;  // 해당 주차의 부작용 리스트
}
