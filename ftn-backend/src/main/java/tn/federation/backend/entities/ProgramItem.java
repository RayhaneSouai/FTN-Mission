package tn.federation.backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "program_item")
public class ProgramItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String label;

    @NotNull
    @Column(name = "start_time")
    private LocalTime time;

    @NotNull
    @Enumerated(EnumType.STRING)
    private ProgramItemType type;

    /** Only required when type == SERIES */
    @Column(name = "number_of_participants")
    private Integer numberOfParticipants;

    /** Single swimmer category for this series. Required when type == SERIES. */
    @Enumerated(EnumType.STRING)
    @Column(name = "swimmer_category")
    private Categorie swimmerCategory;

    /**
     * Gender restriction for this series (HOMME, FEMME, or null for MIXTE). Only
     * for SERIES.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "series_gender")
    private Gender seriesGender;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "day_id", nullable = false)
    private CompetitionDay day;
}
