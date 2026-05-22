package tn.federation.backend.controllers;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tn.federation.backend.dto.PartnershipRequestDTO;
import tn.federation.backend.dto.SponsorshipRequestDTO;
import tn.federation.backend.entities.PartnershipRequest;
import tn.federation.backend.entities.SponsorshipRequest;
import tn.federation.backend.entities.PartnershipRequestStatus;
import tn.federation.backend.entities.SponsorshipRequestStatus;
import tn.federation.backend.entities.User;
import tn.federation.backend.repositories.PartnershipRequestRepository;
import tn.federation.backend.repositories.SponsorshipRequestRepository;
import tn.federation.backend.repositories.UserRepository;

@RestController
@RequestMapping("/api/partners")
public class PartnerRequestController {

    private final PartnershipRequestRepository partnershipRequestRepository;
    private final SponsorshipRequestRepository sponsorshipRequestRepository;
    private final UserRepository userRepository;

    public PartnerRequestController(PartnershipRequestRepository partnershipRequestRepository,
                                    SponsorshipRequestRepository sponsorshipRequestRepository,
                                    UserRepository userRepository) {
        this.partnershipRequestRepository = partnershipRequestRepository;
        this.sponsorshipRequestRepository = sponsorshipRequestRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/requests")
    public ResponseEntity<?> createPartnership(@Valid @RequestBody PartnershipRequestDTO dto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));

        PartnershipRequest req = new PartnershipRequest();
        req.setRequester(requester);
        req.setNomRepresentant(dto.getNomRepresentant());
        req.setAdresse(dto.getAdresse());
        req.setContact(dto.getContact());
        req.setMatriculeFiscale(dto.getMatriculeFiscale());
        req.setTypePartenariat(dto.getTypePartenariat());
        req.setStatut(PartnershipRequestStatus.PENDING);
        req.setCreatedAt(java.time.LocalDateTime.now());

        partnershipRequestRepository.save(req);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/sponsorships")
    public ResponseEntity<?> createSponsorship(@Valid @RequestBody SponsorshipRequestDTO dto) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User requester = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));

        User swimmer = userRepository.findById(dto.getSwimmerId())
                .orElseThrow(() -> new IllegalArgumentException("Nageur introuvable"));

        SponsorshipRequest req = new SponsorshipRequest();
        req.setRequester(requester);
        req.setSwimmer(swimmer);
        req.setTypeSponsor(dto.getTypeSponsor());
        req.setDetails(dto.getDetails());
        req.setStatut(SponsorshipRequestStatus.PENDING);
        req.setCreatedAt(java.time.LocalDateTime.now());

        sponsorshipRequestRepository.save(req);
        return ResponseEntity.ok().build();
    }
}

