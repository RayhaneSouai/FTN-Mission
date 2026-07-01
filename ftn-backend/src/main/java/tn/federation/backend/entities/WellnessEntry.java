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
public class WellnessEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private LocalDate entryDate;

    // 1 = very bad, 5 = excellent
    private int fatigue;      // Niveau de fatigue (1=épuisé, 5=plein d'énergie)
    private int pain;         // Douleurs corporelles (1=sévère, 5=aucune)
    private int sleep;        // Qualité du sommeil (1=très mauvais, 5=excellent)
    private int stress;       // Niveau de stress (1=très stressé, 5=zen)
    private int motivation;   // Motivation (1=nulle, 5=maximale)

    // Calculated average score (1-5)
    private double overallScore;

    @Column(columnDefinition = "TEXT")
    private String notes;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (entryDate == null) entryDate = LocalDate.now();
        // Calculate overall score
        overallScore = (fatigue + pain + sleep + stress + motivation) / 5.0;
    }
}
