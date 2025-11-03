package com.synergy.bokja.repository;

import com.synergy.bokja.entity.EventNameEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EventNameRepository extends JpaRepository<EventNameEntity, Long> {
    Optional<EventNameEntity> findByName(String name);  // ← Optional로 선언
}
