package com.synergy.bokja.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class MedicationCreateRequestDTO {
    @NotBlank
    private String img; // 업로드된 처방전 이미지 경로/키
}
