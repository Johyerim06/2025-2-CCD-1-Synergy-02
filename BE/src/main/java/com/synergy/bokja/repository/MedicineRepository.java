package com.synergy.bokja.repository;

import com.synergy.bokja.entity.MedicineEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.List;

public interface MedicineRepository extends JpaRepository<MedicineEntity, Long> {

    Optional<MedicineEntity> findByName(String name);

    MedicineEntity findByMdno(Long mdno);

    // 퀴즈 오답용
    // DB의 'classification' 중 :excludeList에 없는 것을 5개 랜덤 추출
    @Query(value = "SELECT DISTINCT classification FROM medicine_table " +
            "WHERE classification NOT IN :excludeList ORDER BY RAND() LIMIT 5",
            nativeQuery = true)
    List<String> findRandomClassificationsNotIn(@Param("excludeList") List<String> excludeList);
}