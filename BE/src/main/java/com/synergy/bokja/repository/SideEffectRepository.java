package com.synergy.bokja.repository;


import com.synergy.bokja.entity.EffectEntity;
import com.synergy.bokja.entity.TimeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SideEffectRepository extends JpaRepository<EffectEntity, Long> {
    List<EffectEntity> findAll();
}
