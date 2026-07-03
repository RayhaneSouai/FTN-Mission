package tn.federation.backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(
        name = "formation_registration",
        uniqueConstraints = @UniqueConstraint(columnNames = {"program_id", "swimmer_id"})
)
public class FormationRegistration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "program_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private FormationProgram program;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "swimmer_id", nullable = false)
    @JsonIgnoreProperties({"passwordHash", "participations", "performances", "clubs"})
    private User swimmer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private FormationRegistrationStatus status = FormationRegistrationStatus.PENDING;

    private LocalDateTime registeredAt;
    private LocalDateTime updatedAt;

    @Column(length = 500)
    private String eligibilityNote;

    @Column(length = 500)
    private String decisionNote;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (registeredAt == null) {
            registeredAt = now;
        }
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
