package com.synergy.bokja.dto.ocr;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor // Service에서 값을 넣어주기 위해
public class ParsedMedicineInfo {
    private String name; // 약품명 (예: "슈가메트서방정5/100···")
    private String classification; // 약효분류 (예: "당뇨병 치료제")
    private int doseCount; // 복약 횟수 (예: 6)
    private int doseDays;  // 복약 일수 (예: 3)
}