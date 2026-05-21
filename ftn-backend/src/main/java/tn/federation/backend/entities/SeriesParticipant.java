package tn.federation.backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class SeriesParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int lane; // Ligne d'eau (1–8)

    @ManyToOne
    @JoinColumn(name = "swimmer_id")
    private User swimmer;

    private String entryTime; // Temps d'engagement (e.g. "35.50", "NT")

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "series_id")
    private EventSeries series;
}
