package com.synergy.bokja.repository;

import com.synergy.bokja.entity.MedicineEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.List;

public interface MedicineRepository extends JpaRepository<MedicineEntity, Long> {

    Optional<MedicineEntity> findByName(String name);

    MedicineEntity findByMdno(Long mdno);
}