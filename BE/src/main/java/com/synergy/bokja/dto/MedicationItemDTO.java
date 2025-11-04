package com.synergy.bokja.dto;

import lombok.*;
import java.util.List;

@Getter @NoArgsConstructor @AllArgsConstructor @Builder
public class MedicationItemDTO {
    private Long mdno;
    private String name;
    private String classification;
    private String image;
    private String description;          // user_medicine_item_table.description
    private List<MaterialDTO> materials; // 병용주의 원료 목록
}