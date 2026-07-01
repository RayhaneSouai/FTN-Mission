package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.federation.backend.entities.NutritionPlan;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface NutritionPlanRepository extends JpaRepository<NutritionPlan, Long> {
    List<NutritionPlan> findByUserIdOrderByWeekStartDesc(Long userId);
    Optional<NutritionPlan> findByUserIdAndWeekStart(Long userId, LocalDate weekStart);
}
