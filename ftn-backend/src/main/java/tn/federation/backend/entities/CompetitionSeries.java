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
@Table(name = "competition_series")
public class CompetitionSeries {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String name; // e.g. "Série 1 - 50m DOS Dames"

    private int sortOrder;

    @NotNull
    private LocalTime startTime;

    @Column(length = 500)
    private String metadata; // optional JSON or text for extra info

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "day_part_id", nullable = false)
    private DayPart dayPart;
}
