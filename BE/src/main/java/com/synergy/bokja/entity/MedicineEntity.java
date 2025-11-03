package com.synergy.bokja.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(name = "medicine_table")
public class MedicineEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mdno")
    private Long mdno;

    @Column(name = "name", nullable = false, length = 40)
    private String name;

    @Column(name = "classification", nullable = false, length = 20)
    private String classification;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "image", nullable = false, columnDefinition = "TEXT")
    private String image;

    @Column(name = "information", columnDefinition = "TEXT")
    private String information;
}
