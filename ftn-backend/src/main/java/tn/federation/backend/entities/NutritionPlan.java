package tn.federation.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NutritionPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private LocalDate weekStart; // Monday of the week this plan covers

    private double dailyCalories;       // kcal
    private double dailyProtein;        // grams
    private double dailyCarbs;          // grams
    private double dailyFat;            // grams
    private double dailyWater;          // liters

    // Training load data used to compute the plan
    private int trainingSessions;       // number of sessions this week
    private String trainingLoad;        // LOW / MEDIUM / HIGH

    @Column(columnDefinition = "TEXT")
    private String notes;

    private java.time.LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = java.time.LocalDateTime.now();
    }
}
