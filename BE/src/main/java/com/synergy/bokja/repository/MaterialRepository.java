package com.synergy.bokja.repository;

import com.synergy.bokja.entity.MaterialEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MaterialRepository extends JpaRepository<MaterialEntity, Long> {

    // 퀴즈 오답용
    // 'material_table'의 'name' 중 :excludeList에 없는 것을 5개 랜덤 추출
    @Query(value = "SELECT name FROM material_table " +
            "WHERE name NOT IN :excludeList ORDER BY RAND() LIMIT 5",
            nativeQuery = true)
    List<String> findRandomMaterialsNotIn(@Param("excludeList") List<String> excludeList);
}