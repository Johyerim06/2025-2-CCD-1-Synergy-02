package com.synergy.bokja.entity;

import jakarta.persistence.*;
import lombok.*;

import java.sql.Timestamp;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "description_table")
public class DescriptionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long dno;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(nullable = false)
    private Long umno; // FK → user_medicine_table

    @Column(nullable = false)
    private Timestamp created_at;

    @Column
    private Timestamp updated_at;

    @Column(nullable = false)
    private Long enno; // FK → event_name_table
}
