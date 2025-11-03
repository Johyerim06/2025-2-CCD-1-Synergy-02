package com.synergy.bokja.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "alarm_comb_table")
public class AlarmCombEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long acno;

    @Column(nullable = false)
    private Boolean breakfast;

    @Column(nullable = false)
    private Boolean lunch;

    @Column(nullable = false)
    private Boolean dinner;

    @Column(nullable = false)
    private Boolean night;
}
