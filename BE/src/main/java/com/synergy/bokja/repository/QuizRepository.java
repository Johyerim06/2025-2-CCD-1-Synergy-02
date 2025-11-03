package com.synergy.bokja.repository;

import com.synergy.bokja.entity.QuizEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizRepository extends JpaRepository<QuizEntity, Long> { }