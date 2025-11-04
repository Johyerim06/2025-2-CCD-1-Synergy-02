package com.synergy.bokja.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.util.List;

@Getter
@AllArgsConstructor
public class MedicationDetailMedicineDTO {
    private Long mdno;
    private String name;
    private String classification;
    private String image;
    private String information;
    private String description;
    private List<MaterialDTO> materials;
}
