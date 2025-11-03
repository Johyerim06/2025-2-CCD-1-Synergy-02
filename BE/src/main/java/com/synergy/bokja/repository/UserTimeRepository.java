package com.synergy.bokja.repository;

import com.synergy.bokja.entity.UserEntity;
import com.synergy.bokja.entity.UserTimeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserTimeRepository extends JpaRepository<UserTimeEntity, Long> {
    Optional<UserTimeEntity> findByUser_UnoAndTime_Type(Long uno, String type);
}
