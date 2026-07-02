package tn.federation.backend.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString(exclude = {"club", "validatedBy"})
@Entity
@Table(
        name = "club_season_validation",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_club_season_validation",
                columnNames = {"club_id", "season"}
        )
)
public class ClubSeasonValidation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "club_id")
    private Club club;

    @Column(nullable = false, length = 20)
    private String season;

    @Column(nullable = false)
    private Boolean isValidated = true;

    @Column(nullable = false)
    private LocalDateTime validatedAt;

    @ManyToOne(optional = false)
    @JoinColumn(name = "validated_by_id")
    private User validatedBy;

    @PrePersist
    void onCreate() {
        if (validatedAt == null) {
            validatedAt = LocalDateTime.now();
        }
    }
}
