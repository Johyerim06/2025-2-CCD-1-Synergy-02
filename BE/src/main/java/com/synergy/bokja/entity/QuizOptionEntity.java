package com.synergy.bokja.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "quiz_option_table")
public class QuizOptionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long qono;

    @Column(nullable = false)
    private Long qno;

    @Column(nullable = false, length = 200)
    private String content;

    @Column(name = "is_correct", nullable = false)
    private Boolean isCorrect;
}
