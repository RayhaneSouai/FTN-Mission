package tn.federation.backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "formation_program")
public class FormationProgram {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BrevetType brevetType;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "season_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Season season;

    @Enumerated(EnumType.STRING)
    private FormationProgramStatus status = FormationProgramStatus.DRAFT;

    // Période d'inscription
    private LocalDate registrationStartDate;
    private LocalDate registrationEndDate;
    @Column(length = 500)
    private String registrationLocation;
    @Column(columnDefinition = "TEXT")
    private String registrationConditions;
    private BigDecimal registrationFee;

    // Institut / lieu
    @Column(length = 500)
    private String instituteAddress;
    @Column(length = 120)
    private String instituteEmail;
    @Column(length = 30)
    private String institutePhone;
    @Column(length = 30)
    private String instituteFax;

    // Formation théorique
    private LocalDate theoreticalStartDate;
    private LocalDate theoreticalEndDate;
    @Column(length = 300)
    private String theoreticalLocation;
    @Column(length = 120)
    private String theoreticalHours;
    private LocalDate theoreticalExamDate;
    @Column(length = 80)
    private String theoreticalExamTime;

    // Formation pratique
    @Column(columnDefinition = "TEXT")
    private String practicalDescription;
    private LocalDate practicalPeriodStart;
    private LocalDate practicalPeriodEnd;
    @Column(columnDefinition = "TEXT")
    private String resultAnnouncementNote;

    @OneToMany(mappedBy = "program", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("sortOrder ASC")
    private List<FormationScheduleItem> scheduleItems = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
