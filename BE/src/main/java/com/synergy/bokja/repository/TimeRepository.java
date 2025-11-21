package com.synergy.bokja.repository;

import com.synergy.bokja.entity.TimeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface TimeRepository extends JpaRepository<TimeEntity, Long> {
    List<TimeEntity> findByType(String type);
    Optional<TimeEntity> findByTypeAndTime(String type, LocalTime time);

}
