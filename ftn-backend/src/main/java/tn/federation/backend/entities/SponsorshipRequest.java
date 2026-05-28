package tn.federation.backend.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "sponsorship_request")
public class SponsorshipRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Swimmer being sponsored
    @ManyToOne
    @JoinColumn(name = "swimmer_id")
    private User swimmer;

    @Enumerated(EnumType.STRING)
    private SponsorshipType typeSponsor;

    // Sponsor information
    private String nomSponsor;

    private String entreprise;

    private String email;

    private String telephone;

    private Double montant;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Enumerated(EnumType.STRING)
    private SponsorshipRequestStatus statut;

    @Column(columnDefinition = "TEXT")
    private String decisionNotes;

    private LocalDateTime createdAt;

    // Nullable because visitors can submit anonymously
    @ManyToOne
    @JoinColumn(name = "requester_id")
    private User requester;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();

        if (this.statut == null) {
            this.statut = SponsorshipRequestStatus.PENDING;
        }
    }
}