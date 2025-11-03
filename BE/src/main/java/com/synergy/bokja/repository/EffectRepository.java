package com.synergy.bokja.repository;

import com.synergy.bokja.entity.EffectEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EffectRepository extends JpaRepository<EffectEntity, Long> {
    EffectEntity findByEfno(Long efno);
}
