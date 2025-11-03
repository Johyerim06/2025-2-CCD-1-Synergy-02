package com.synergy.bokja.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.util.List;

@Getter
@AllArgsConstructor
public class ReportDetailResponseDTO {
    private Long rno;
    private String hospital;
    private String category;
    private int taken;
    private List<MedicineDTO> medicine;           // 약품 리스트
    private List<ReportCycleDTO> cycle;           // 복약 주기
    private List<ReportEffectWeekDTO> effects;    // 주차별 부작용
    private String description;                   // 리포트 설명
}
