package com.synergy.bokja.entity;

import jakarta.persistence.*;
import lombok.*;

import java.sql.Timestamp;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "user_medicine_table")
public class UserMedicineEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long umno;

    @Column(nullable = false)
    private Long uno;

    @Column(nullable = false, length = 20)
    private String category;

    @Column(nullable = false)
    private Timestamp created_at;

    @Column(nullable = false, length = 40)
    private String hospital;

    @Column(nullable = false)
    private Long acno; // FK → alarm_comb_table

    @Column(nullable = false)
    private int taken;
}
