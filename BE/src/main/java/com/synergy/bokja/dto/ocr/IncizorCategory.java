package com.synergy.bokja.dto.ocr;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class IncizorCategory {
    private String category;
    private String value;
    private List<IncizorCategory> sub;
}
