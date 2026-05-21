package tn.federation.backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
public class EventSeries {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private int seriesNumber;

    private LocalTime startTime;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "event_id")
    private CompetitionEvent event;

    @OneToMany(mappedBy = "series", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SeriesParticipant> participants;
}
