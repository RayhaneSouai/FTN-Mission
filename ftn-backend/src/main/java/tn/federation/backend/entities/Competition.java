package tn.federation.backend.entities;

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
    @Enumerated(EnumType.STRING)
    private Discipline discipline;
    private LocalDate startDate;
    private LocalDate endDate;
    private String location;
    private String region;
    @Enumerated(EnumType.STRING)
    private CompetitionStatus status;

    @OneToMany(mappedBy = "competition")
    private List<Participation> participations;

    @OneToMany(mappedBy = "competition")
    private List<MediaItem> mediaItems;
}
