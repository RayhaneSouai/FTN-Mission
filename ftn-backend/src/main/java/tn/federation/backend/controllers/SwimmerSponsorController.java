package tn.federation.backend.controllers;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tn.federation.backend.entities.SponsorshipRequest;
import tn.federation.backend.entities.SponsorshipRequestStatus;
import tn.federation.backend.entities.User;
import tn.federation.backend.repositories.SponsorshipRequestRepository;
import tn.federation.backend.repositories.UserRepository;

import java.util.List;

@RestController
@RequestMapping("/api/swimmers")
public class SwimmerSponsorController {

    private final SponsorshipRequestRepository sponsorshipRequestRepository;
    private final UserRepository userRepository;

    public SwimmerSponsorController(SponsorshipRequestRepository sponsorshipRequestRepository,
                                     UserRepository userRepository) {
        this.sponsorshipRequestRepository = sponsorshipRequestRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/me/sponsors")
    public List<SponsorshipRequest> getMyApprovedSponsors() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User me = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));

        return sponsorshipRequestRepository.findAll().stream()
                .filter(r -> r.getSwimmer() != null && r.getSwimmer().getId().equals(me.getId()))
                .filter(r -> r.getStatut() == SponsorshipRequestStatus.APPROVED)
                .toList();
    }
}

