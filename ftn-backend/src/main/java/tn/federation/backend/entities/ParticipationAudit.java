package tn.federation.backend.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "participation_audit")
public class ParticipationAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "swimmer_id", nullable = false)
    private Long swimmerId;

    @Column(name = "swimmer_name", nullable = false)
    private String swimmerName;

    @Column(name = "competition_id", nullable = false)
    private Long competitionId;

    @Column(name = "competition_name", nullable = false)
    private String competitionName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ParticipationRequestStatus decision;

    @Column(length = 500)
    private String reason;

    @Column(name = "decided_at", nullable = false)
    private LocalDateTime decidedAt;
}
