package com.synergy.bokja.repository;

import com.synergy.bokja.entity.TimeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TimeRepository extends JpaRepository<TimeEntity, Long> {
    List<TimeEntity> findAllByType(String type);
}
