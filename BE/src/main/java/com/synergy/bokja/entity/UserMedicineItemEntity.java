package com.synergy.bokja.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "user_medicine_item_table")
public class UserMedicineItemEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long umino;

    @Column(nullable = false)
    private Long umno;

    @Column(nullable = false)
    private Long mdno;

    @Column(columnDefinition = "TEXT")
    private String description;
}
