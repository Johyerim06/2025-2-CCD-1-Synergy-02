package com.synergy.bokja.repository;

import com.synergy.bokja.entity.EventEntity;
import com.synergy.bokja.entity.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface EventRepository extends JpaRepository<EventEntity, Long> {
    List<EventEntity> findAllByUserMedicine_UmnoIn(List<Long> umnoList);
    List<EventEntity> findAllByUserMedicine_User_UnoAndStatus(Long uno, EventStatus status);

    List<EventEntity> findAllByUserMedicine_User_UnoAndStatusAndCreatedAtBetween(
            Long uno,
            EventStatus status,
            LocalDateTime start,
            LocalDateTime end
    );
}
