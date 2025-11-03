package com.synergy.bokja.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(name = "event_name_table")
public class EventNameEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "enno")
    private Long enno;

    @Column(name = "name", nullable = false, length = 20)
    private String name; // 'alarm', 'condition', 'call', 'default(main)'
}