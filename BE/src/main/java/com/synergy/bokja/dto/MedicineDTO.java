package com.synergy.bokja.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MedicineDTO {
    private Long mdno;              // 약품 ID
    private String name;            // 약품명
    private String classification;  // 약효 분류
    private String image;           // 이미지 URL
    private String information;     // 주의사항 or 설명
}
