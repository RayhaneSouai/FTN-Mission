package tn.federation.backend.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.federation.backend.dto.SponsorshipAdminDecisionDTO;
import tn.federation.backend.entities.SponsorshipRequest;
import tn.federation.backend.entities.SponsorshipRequestStatus;
import tn.federation.backend.repositories.SponsorshipRequestRepository;

import java.util.List;

@RestController
@RequestMapping("/api/admin/partners")
public class AdminSponsorshipController {

    private final SponsorshipRequestRepository sponsorshipRequestRepository;

    public AdminSponsorshipController(SponsorshipRequestRepository sponsorshipRequestRepository) {
        this.sponsorshipRequestRepository = sponsorshipRequestRepository;
    }

    @GetMapping("/sponsorships")
    public List<SponsorshipRequest> listPendingSponsorshipRequests() {
        return sponsorshipRequestRepository.findAll().stream()
                .filter(r -> r.getStatut() == SponsorshipRequestStatus.PENDING)
                .toList();
    }

    @PostMapping("/sponsorships/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Long id, @RequestBody SponsorshipAdminDecisionDTO dto) {
        SponsorshipRequest req = sponsorshipRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Demande introuvable"));
        req.setStatut(SponsorshipRequestStatus.APPROVED);
        sponsorshipRequestRepository.save(req);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/sponsorships/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Long id, @RequestBody SponsorshipAdminDecisionDTO dto) {
        SponsorshipRequest req = sponsorshipRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Demande introuvable"));
        req.setStatut(SponsorshipRequestStatus.REJECTED);
        sponsorshipRequestRepository.save(req);
        return ResponseEntity.ok().build();
    }
}

