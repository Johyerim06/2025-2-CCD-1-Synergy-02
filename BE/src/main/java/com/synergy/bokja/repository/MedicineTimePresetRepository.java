package com.synergy.bokja.repository;


import com.synergy.bokja.entity.ReportEntity;
import com.synergy.bokja.entity.TimeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicineTimePresetRepository extends JpaRepository<TimeEntity, Long> {
    List<TimeEntity> findByType(String type);
}
