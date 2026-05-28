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

    @ManyToOne
    @JoinColumn(name = "swimmer_id")
    private User swimmer;

    @Enumerated(EnumType.STRING)
    private SponsorshipType typeSponsor;

    private String details;

    @Enumerated(EnumType.STRING)
    private ParticipationRequestStatus statut;

    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "requester_id")
    private User requester;
}

