package com.synergy.bokja.repository;

import com.synergy.bokja.entity.ConditionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.sql.Timestamp;
import java.util.List;

public interface ConditionRepository extends JpaRepository<ConditionEntity, Long> {

    // 사용자 기준 기간 내 기록 전부
    List<ConditionEntity> findAllByUnoAndTimeBetween(Long uno, Timestamp start, Timestamp end);

    // 특정 부작용ID 필터(옵션) — 필요 시 사용
    List<ConditionEntity> findAllByUnoAndEfnoAndTimeBetween(Long uno, Long efno, Timestamp start, Timestamp end);
}
