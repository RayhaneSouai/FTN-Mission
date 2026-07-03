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
    private ProgramType programType = ProgramType.COACH_CERTIFICATION;

    // Required when programType == COACH_CERTIFICATION; null for SWIMMER_TRAINING.
    @Enumerated(EnumType.STRING)
    private BrevetType brevetType;

    // ─── Swimmer training fields (required when programType == SWIMMER_TRAINING) ───
    @Enumerated(EnumType.STRING)
    private TargetCategory targetCategory;

    private Integer maxParticipants;

    // EAGER to match the existing `season` field on this entity — open-in-view is
    // disabled, so a LAZY proxy here throws when Jackson serializes read-only
    // listing responses outside the (non-transactional) service method boundary.
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "coach_id")
    @JsonIgnoreProperties({"passwordHash", "participations", "performances", "clubs", "club"})
    private User coach;

    @Column(length = 255)
    private String location;

    private java.math.BigDecimal pricePerSession;

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

    @OneToMany(mappedBy = "program", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("sortOrder ASC")
    private List<FormationDocument> documents = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Populated on-demand by the service layer (via countRegistrationsPerProgram) — not persisted.
    @Transient
    private Integer registeredCount;

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
