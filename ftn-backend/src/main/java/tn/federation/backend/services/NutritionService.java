package tn.federation.backend.services;

import org.springframework.stereotype.Service;
import tn.federation.backend.entities.NutritionPlan;
import tn.federation.backend.repositories.NutritionPlanRepository;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.Optional;

@Service
public class NutritionService {

    private final NutritionPlanRepository planRepository;

    public NutritionService(NutritionPlanRepository planRepository) {
        this.planRepository = planRepository;
    }

    public NutritionPlan getOrGeneratePlan(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate weekStart = today.with(DayOfWeek.MONDAY);

        Optional<NutritionPlan> existing = planRepository.findByUserIdAndWeekStart(userId, weekStart);
        if (existing.isPresent()) {
            return existing.get();
        }

        // Generate a new plan based on default/moderate load for now.
        // In a full implementation, this would query the performance module for recent workload.
        NutritionPlan newPlan = NutritionPlan.builder()
                .userId(userId)
                .weekStart(weekStart)
                .dailyCalories(2800) // Base for swimmer
                .dailyProtein(150)
                .dailyCarbs(350)
                .dailyFat(80)
                .dailyWater(3.5)
                .trainingSessions(5)
                .trainingLoad("MEDIUM")
                .notes("Plan généré automatiquement pour la semaine.")
                .build();

        return planRepository.save(newPlan);
    }
}
