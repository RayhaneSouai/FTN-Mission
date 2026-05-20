package tn.federation.backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Entity
public class Competition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    private Discipline discipline;

    private LocalDate startDate;

    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "VARCHAR(255)")
    private Piscine lieu;

    @Enumerated(EnumType.STRING)
    private Region region;

    /** Allowed age categories (multiple). Empty = all categories allowed. */
    @ElementCollection(targetClass = Categorie.class, fetch = FetchType.EAGER)
    @CollectionTable(name = "competition_categories", joinColumns = @JoinColumn(name = "competition_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "categorie", columnDefinition = "VARCHAR(50)")
    private Set<Categorie> allowedCategories = new HashSet<>();

    @Enumerated(EnumType.STRING)
    @JsonSetter(nulls = Nulls.SKIP)
    private CompetitionStatus status = CompetitionStatus.PLANIFIEE;

    /** Status of the competition programme (DRAFT / APPROVED) */
    @Enumerated(EnumType.STRING)
    @Column(name = "programme_status")
    @JsonSetter(nulls = Nulls.SKIP)
    private ProgrammeStatus programmeStatus;

    @JsonIgnore
    @OneToMany(mappedBy = "competition")
    private List<Participation> participations;

    @JsonIgnore
    @OneToMany(mappedBy = "competition", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CompetitionDay> days;

    @JsonIgnore
    @OneToMany(mappedBy = "competition")
    private List<MediaItem> mediaItems;

    /* ─── Participation Conditions ─── */

    /** Deadline for participation requests (null = no deadline) */
    private LocalDate participationDeadline;

    /** Allowed gender (null = both genders allowed) */
    @Enumerated(EnumType.STRING)
    @Column(name = "allowed_gender")
    private Gender allowedGender;

    /** Minimum age to participate (null = no min) */
    private Integer minAge;

    /** Maximum age to participate (null = no max) */
    private Integer maxAge;

    /** Maximum events per swimmer (null = unlimited) */
    private Integer maxEvents;

    /** Free-text conditions defined by admin (manually reviewed) */
    @Column(name = "custom_conditions", columnDefinition = "TEXT")
    private String customConditions;
}