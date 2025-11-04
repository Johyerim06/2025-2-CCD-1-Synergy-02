package com.synergy.bokja.repository;

import com.synergy.bokja.entity.CombinationEntity;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CombinationRepository extends JpaRepository<CombinationEntity, Long> {

    @Query("SELECT c FROM CombinationEntity c " +
            "WHERE (:medName LIKE CONCAT('%', COALESCE(c.name, ''), '%')) " +
            "   OR (:medName LIKE CONCAT('%', COALESCE(c.ingredient, ''), '%'))")
    List<CombinationEntity> findRelatedCombinations(@Param("medName") String medName);

    List<CombinationEntity> findAllByIngredientIsNotNull();
}