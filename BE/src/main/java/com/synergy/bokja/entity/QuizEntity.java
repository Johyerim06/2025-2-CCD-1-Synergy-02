package com.synergy.bokja.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "quiz_table")
public class QuizEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long qno;

    @Column(nullable = false)
    private Long umno;               // FK → user_medicine_table(umno)

    @Column(length = 20)
    private String type;

    @Column(nullable = false, length = 40)
    private String question;
}
