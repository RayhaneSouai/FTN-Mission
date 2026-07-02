package tn.federation.backend.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(
        name = "club_join_request",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_pending_club_join_request",
                columnNames = {"swimmer_id", "club_id", "status"}
        )
)
public class ClubJoinRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "swimmer_id")
    private User swimmer;

    @ManyToOne(optional = false)
    @JoinColumn(name = "club_id")
    private Club club;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ClubJoinRequestStatus status = ClubJoinRequestStatus.PENDING;

    @Column(nullable = false)
    private LocalDateTime requestedAt;

    private LocalDateTime reviewedAt;

    @Column(columnDefinition = "TEXT")
    private String message;

    @PrePersist
    void onCreate() {
        if (requestedAt == null) {
            requestedAt = LocalDateTime.now();
        }
    }
}
