package tn.federation.backend.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Entity
public class Participation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDateTime registeredAt;
    @Enumerated(EnumType.STRING)
    private RegistrationStatus status;
    private Double officialTime;

    @Column(name = "rank_pos")
    private Integer rank;
    private LocalDateTime recordedAt;
    private Boolean disqualified;

    @ManyToOne
    @JoinColumn(name = "swimmer_id")
    User swimmer;

    @ManyToOne
    @JoinColumn(name = "competition_id")
    Competition competition;
}
