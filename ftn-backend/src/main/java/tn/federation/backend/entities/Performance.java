package tn.federation.backend.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Entity
public class Performance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Double time;
    private Integer distance;
    @Enumerated(EnumType.STRING)
    private StrokeType stroke;
    private LocalDate date;
    private Boolean isPersonalRecord;

    @ManyToOne
    @JoinColumn(name = "swimmer_id")
    User swimmer;
}
