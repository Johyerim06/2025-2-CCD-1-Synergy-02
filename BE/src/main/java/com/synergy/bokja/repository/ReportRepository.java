package com.synergy.bokja.repository;

import com.synergy.bokja.entity.ReportEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReportRepository extends JpaRepository<ReportEntity, Long> {

    // 특정 복약(umno)에 속한 리포트 목록 조회
    List<ReportEntity> findAllByUserMedicine_UmnoIn(List<Long> umnos);

    // 리포트 단건 상세 조회
    Optional<ReportEntity> findByRno(Long rno);
}
