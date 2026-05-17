package tn.federation.backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

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

    @Enumerated(EnumType.STRING)
    private Categorie categorie;

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
}