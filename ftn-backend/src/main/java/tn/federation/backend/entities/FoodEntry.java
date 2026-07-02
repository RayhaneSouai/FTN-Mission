package tn.federation.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private LocalDate entryDate;

    // BREAKFAST, LUNCH, DINNER, SNACK
    private String mealType;

    private String foodName;

    private int calories;   // kcal

    private int protein;    // grams

    private int carbs;      // grams

    private int fat;        // grams

    private double waterMl; // milliliters of water consumed with this entry

    @Column(columnDefinition = "TEXT")
    private String notes;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (entryDate == null) entryDate = LocalDate.now();
    }
}
