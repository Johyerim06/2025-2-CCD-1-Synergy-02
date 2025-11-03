package com.synergy.bokja.repository;

import com.synergy.bokja.entity.UserMedicineItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserMedicineItemRepository extends JpaRepository<UserMedicineItemEntity, Long> {

    List<UserMedicineItemEntity> findAllByUmno(Long umno);
}