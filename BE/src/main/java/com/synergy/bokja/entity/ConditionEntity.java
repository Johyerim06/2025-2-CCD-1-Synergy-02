package com.synergy.bokja.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "condition_table")
public class ConditionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long cdno;

    @Column(nullable = false)
    private java.sql.Timestamp time; // 발생 시각

    @Column(nullable = false)
    private Long uno; // 사용자 ID

    @Column(nullable = false)
    private Long efno; // 부작용 ID (effect_table)
}
