package com.synergy.bokja.repository;

import com.synergy.bokja.entity.AlarmCombEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AlarmCombRepository extends JpaRepository<AlarmCombEntity, Long> {
    Optional<AlarmCombEntity> findByBreakfastAndLunchAndDinnerAndNight(
            Boolean breakfast, Boolean lunch, Boolean dinner, Boolean night);
}
