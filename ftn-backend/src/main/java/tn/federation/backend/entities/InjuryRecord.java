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
public class InjuryRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    // Body zone: SHOULDER, KNEE, BACK, NECK, ELBOW, WRIST, HIP, ANKLE, OTHER
    private String bodyZone;

    private String description;

    private LocalDate startDate;

    private LocalDate endDate; // null if still active

    // ACTIVE, RECOVERING, HEALED
    private String status;

    // Pain level at declaration (1-10)
    private int painLevel;

    @Column(columnDefinition = "TEXT")
    private String rehabilitationNotes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (startDate == null) startDate = LocalDate.now();
        if (status == null) status = "ACTIVE";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
