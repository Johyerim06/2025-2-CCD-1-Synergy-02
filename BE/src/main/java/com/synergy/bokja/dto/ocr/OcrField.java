package com.synergy.bokja.dto.ocr;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@JsonIgnoreProperties(ignoreUnknown = true)
public class OcrField {
    private String name; // 예: "병원명", "약품명"

    @JsonProperty("inferText") // JSON의 'inferText'를 'text' 필드에 매핑
    private String text;
}