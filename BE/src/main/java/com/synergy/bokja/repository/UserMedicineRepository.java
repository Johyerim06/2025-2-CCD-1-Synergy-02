package com.synergy.bokja.repository;

import com.synergy.bokja.entity.UserMedicineEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserMedicineRepository extends JpaRepository<UserMedicineEntity, Long> {
    UserMedicineEntity findByUmno(Long umno);
    List<UserMedicineEntity> findAllByUser_Uno(Long uno);
    UserMedicineEntity findByUmnoAndUser_Uno(Long umno, Long uno);
}