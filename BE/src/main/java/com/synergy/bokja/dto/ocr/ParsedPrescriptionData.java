package com.synergy.bokja.dto.ocr;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class ParsedPrescriptionData {
    private String hospitalName; // 병원명
    private List<ParsedMedicineInfo> medicines; // 약품 목록
}
