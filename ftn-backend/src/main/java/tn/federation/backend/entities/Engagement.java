package tn.federation.backend.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Engagement d'un nageur sur une épreuve spécifique d'une compétition.
 * Respecte le flux FTN : Nageur demande → Club valide → Admin confirme.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "engagement", uniqueConstraints = @UniqueConstraint(columnNames = { "swimmer_id", "event_id" }))
public class Engagement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "swimmer_id", nullable = false)
    private User swimmer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private CompetitionEvent event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "competition_id", nullable = false)
    private Competition competition;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;

    /** Temps d'engagement déclaré (en secondes), null si NT */
    private Double entryTime;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EngagementStatus status = EngagementStatus.DEMANDE;

    private LocalDateTime requestedAt;

    private LocalDateTime validatedAt;

    @Column(length = 500)
    private String rejectionReason;
}
