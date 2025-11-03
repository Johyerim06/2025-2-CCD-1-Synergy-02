package com.synergy.bokja.repository;

import com.synergy.bokja.entity.CycleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CycleRepository extends JpaRepository<CycleEntity, Long> {

    CycleEntity findByCyno(Long cyno);
    Optional<CycleEntity> findByUserMedicine_Umno(Long umno);
    List<CycleEntity> findAllByUserMedicine_UmnoIn(List<Long> umnoList);
}