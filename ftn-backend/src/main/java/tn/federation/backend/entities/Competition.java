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
    private Piscine lieu;

    @Enumerated(EnumType.STRING)
    private Region region;

    @Enumerated(EnumType.STRING)
    private Secteur secteur;

    // International fields
    private String country;
    private String city;
    private String venue;

    @Enumerated(EnumType.STRING)
    @JsonSetter(nulls = Nulls.SKIP)
    private CompetitionStatus status = CompetitionStatus.PLANIFIEE;

    @JsonIgnore
    @OneToMany(mappedBy = "competition")
    private List<Participation> participations;

    @JsonIgnore
    @OneToMany(mappedBy = "competition")
    private List<MediaItem> mediaItems;
}