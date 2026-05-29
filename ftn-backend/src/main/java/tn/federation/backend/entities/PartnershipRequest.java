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

    // Company information
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

    // Nullable for anonymous visitors
    @ManyToOne
    @JoinColumn(name = "requester_id")
    private User requester;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();

        if (this.statut == null) {
            this.statut = PartnershipRequestStatus.PENDING;
        }
    }
}