package tn.federation.backend.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "participant_distribution")
public class ParticipantDistribution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "competition_id", nullable = false)
    private Competition competition;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_item_id", nullable = false)
    private ProgramItem series;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "swimmer_id", nullable = false)
    private User swimmer;

    private Integer position;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DistributionStatus status;

    private LocalDateTime generatedAt;

    private LocalDateTime approvedAt;
}
