package com.synergy.bokja.repository;

import com.synergy.bokja.entity.ConditionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

public interface ConditionRepository extends JpaRepository<ConditionEntity, Long> {

    List<ConditionEntity> findAllByUser_UnoAndTimeBetween(Long uno, Timestamp start, Timestamp end);

    // // 특정 부작용ID 필터 (옵션)
    List<ConditionEntity> findAllByUser_UnoAndEffect_EfnoAndTimeBetween(
            Long uno, Long efno, Timestamp startTime, Timestamp endTime
    );

    List<ConditionEntity> findAllByUser_UnoAndTimeBetween(Long uno, LocalDateTime start, LocalDateTime end);
}
