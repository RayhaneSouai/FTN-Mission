package tn.federation.backend.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "club_join_request")
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

    @Column(columnDefinition = "TEXT")
    private String motivationLetter;

    private String currentLevel;
    private String previousClub;
    private String availability;

    @Column(columnDefinition = "TEXT")
    private String rejectionReason;

    private Integer eligibilityScore;
    private Integer criteriaMet;
    private Integer criteriaTotal;

    @PrePersist
    void onCreate() {
        if (requestedAt == null) {
            requestedAt = LocalDateTime.now();
        }
    }
}
