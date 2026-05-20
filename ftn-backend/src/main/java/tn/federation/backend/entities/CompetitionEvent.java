package tn.federation.backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class CompetitionEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int eventNumber;

    private String eventName; // e.g. "50 m DOS Dames", "800 m NAGE LIBRE Messieurs"

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private String distance; // e.g. "50m", "100m", "800m"

    private String stroke; // e.g. "DOS", "NAGE LIBRE", "PAPILLON", "BRASSE", "4 NAGES"

    // ── Critères d'éligibilité FTN ──

    /** Catégorie d'âge requise pour cette épreuve */
    @Enumerated(EnumType.STRING)
    @Column(name = "required_age_category")
    private AgeCategory requiredAgeCategory;

    /** Temps minima requis pour s'engager (en secondes), null = pas de minima */
    @Column(name = "minima_time")
    private Double minimaTime;

    /** Nombre maximum de participants pour cette épreuve */
    @Column(name = "max_participants")
    private Integer maxParticipants;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "day_id")
    private CompetitionDay day;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EventSeries> series;

    @JsonIgnore
    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL)
    private List<Engagement> engagements;
}
