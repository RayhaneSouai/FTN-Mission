package tn.federation.backend.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "partnership_request")
public class PartnershipRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // === Existing fields ===
    private String nomEntreprise;
    private String nomRepresentant;
    private String email;
    private String telephone;
    private String adresse;
    private String siteWeb;
    private String matriculeFiscale;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    private PartnershipType typePartenariat;

    @Enumerated(EnumType.STRING)
    private PartnershipRequestStatus statut;

    @Column(columnDefinition = "TEXT")
    private String decisionNotes;

    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;
    @Column(length = 500)
    private String modeleDeCollaboration;

    @ManyToOne
    @JoinColumn(name = "requester_id")
    private User requester;

    // === NEW Advanced Fields ===
    @Column(columnDefinition = "TEXT")
    private String proposition;           // Detailed collaboration proposition

    @Column(columnDefinition = "TEXT")
    private String addedValue;            // What value they bring (key for scoring)

    private Double proposedBudget;

    private Long targetCompetitionId;     // Optional - link to a competition

    private String targetClub;            // Optional

    private int addedValueScore;          // Auto-calculated 0-100

    @Column(columnDefinition = "TEXT")
    private String suggestedModels;       // Auto-generated suggestions for admin

    // === Updated PrePersist ===
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        if (this.statut == null) {
            this.statut = PartnershipRequestStatus.PENDING;
        }
    }
}