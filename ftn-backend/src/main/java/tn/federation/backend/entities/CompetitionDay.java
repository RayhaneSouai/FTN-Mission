package tn.federation.backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "competition_day", uniqueConstraints = @UniqueConstraint(columnNames = { "competition_id",
        "day_number" }))
public class CompetitionDay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Min(1)
    @Column(name = "day_number")
    private int dayNumber;

    @NotNull
    private LocalDate date;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "competition_id", nullable = false)
    private Competition competition;

    @OneToMany(mappedBy = "day", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("time ASC")
    private List<ProgramItem> items = new ArrayList<>();

    // Legacy relation for backward compat
    @OneToMany(mappedBy = "day", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("eventNumber ASC")
    private List<CompetitionEvent> events = new ArrayList<>();
}
