package com.synergy.bokja.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ReportEffectItemDTO {
    private Long efno;    // 부작용 ID
    private String name;  // 부작용 이름
    private int count;    // 발생 횟수
}
