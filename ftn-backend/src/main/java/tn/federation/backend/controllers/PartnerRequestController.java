package tn.federation.backend.controllers;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import tn.federation.backend.dto.PartnershipRequestDTO;
import tn.federation.backend.dto.SponsorshipRequestDTO;
import tn.federation.backend.entities.*;
import tn.federation.backend.repositories.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/partners")
public class PartnerRequestController {

    private final PartnershipRequestRepository partnershipRequestRepository;
    private final SponsorshipRequestRepository sponsorshipRequestRepository;
    private final UserRepository userRepository;

    public PartnerRequestController(
            PartnershipRequestRepository partnershipRequestRepository,
            SponsorshipRequestRepository sponsorshipRequestRepository,
            UserRepository userRepository) {
        this.partnershipRequestRepository = partnershipRequestRepository;
        this.sponsorshipRequestRepository = sponsorshipRequestRepository;
        this.userRepository = userRepository;
    }

    // =========================
    // PARTNERSHIP REQUEST
    // =========================
    @PostMapping("/requests")
    public ResponseEntity<?> createPartnership(@Valid @RequestBody PartnershipRequestDTO dto) {

        User requester = getAuthenticatedUserOptional();

        PartnershipRequest req = new PartnershipRequest();

        req.setRequester(requester);

        req.setNomEntreprise(dto.getNomEntreprise());
        req.setNomRepresentant(dto.getNomRepresentant());
        req.setEmail(dto.getEmail());
        req.setTelephone(dto.getTelephone());
        req.setAdresse(dto.getAdresse());
        req.setSiteWeb(dto.getSiteWeb());
        req.setMatriculeFiscale(dto.getMatriculeFiscale());
        req.setTypePartenariat(dto.getTypePartenariat());

        req.setMessage(dto.getMessage());

        req.setStatut(PartnershipRequestStatus.PENDING);
        req.setCreatedAt(LocalDateTime.now());

        partnershipRequestRepository.save(req);

        return ResponseEntity.ok().build();
    }

    // =========================
    // SPONSORSHIP REQUEST
    // =========================
    @PostMapping("/sponsorships")
    public ResponseEntity<?> createSponsorship(@Valid @RequestBody SponsorshipRequestDTO dto) {

        User requester = getAuthenticatedUserOptional();

        User swimmer = userRepository.findById(dto.getSwimmerId())
                .orElseThrow(() -> new IllegalArgumentException("Nageur introuvable"));

        SponsorshipRequest req = new SponsorshipRequest();

        req.setRequester(requester);
        req.setSwimmer(swimmer);

        req.setNomSponsor(dto.getNomSponsor());
        req.setEntreprise(dto.getEntreprise());
        req.setEmail(dto.getEmail());
        req.setTelephone(dto.getTelephone());
        req.setTypeSponsor(dto.getTypeSponsor());
        req.setMontant(dto.getMontant());
        req.setMessage(dto.getMessage());

        req.setStatut(SponsorshipRequestStatus.PENDING);
        req.setCreatedAt(LocalDateTime.now());

        sponsorshipRequestRepository.save(req);

        return ResponseEntity.ok().build();
    }

    // =========================
    // HELPER: optional auth
    // =========================
    private User getAuthenticatedUserOptional() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated() ||
                auth.getName() == null ||
                auth.getName().equals("anonymousUser")) {
            return null;
        }

        return userRepository.findByEmail(auth.getName()).orElse(null);
    }
}