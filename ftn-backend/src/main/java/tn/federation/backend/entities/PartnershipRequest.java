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

    private String nomRepresentant;

    private String adresse;

    private String contact;

    private String matriculeFiscale;

    @Enumerated(EnumType.STRING)
    private PartnershipType typePartenariat;

    @Enumerated(EnumType.STRING)
    private PartnershipRequestStatus statut;

    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "requester_id")
    private User requester;
}

