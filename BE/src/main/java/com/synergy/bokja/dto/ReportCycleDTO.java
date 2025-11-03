package com.synergy.bokja.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ReportCycleDTO {
    private String start_date;   // 시작일
    private String end_date;     // 종료일
    private int total_cycle;     // 전체 복약 횟수
    private Integer cur_cycle;   // 현재 복약 횟수 (nullable)
    private Integer save_cycle;  // 성공 복약 횟수 (nullable)
}
