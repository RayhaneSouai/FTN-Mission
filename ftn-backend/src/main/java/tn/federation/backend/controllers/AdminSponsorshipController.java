package tn.federation.backend.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.federation.backend.dto.SponsorshipAdminDecisionDTO;
import tn.federation.backend.entities.SponsorshipRequest;
import tn.federation.backend.entities.SponsorshipRequestStatus;
import tn.federation.backend.repositories.SponsorshipRequestRepository;

import java.util.List;

@RestController
@RequestMapping("/api/admin/partners/sponsorships")
public class AdminSponsorshipController {

    private final SponsorshipRequestRepository sponsorshipRequestRepository;

    public AdminSponsorshipController(SponsorshipRequestRepository sponsorshipRequestRepository) {
        this.sponsorshipRequestRepository = sponsorshipRequestRepository;
    }

    // =========================
    // GET ALL REQUESTS
    // =========================
    @GetMapping
    public List<SponsorshipRequest> getAll() {
        return sponsorshipRequestRepository.findAll();
    }

    // =========================
    // APPROVE
    // =========================
    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approve(
            @PathVariable Long id,
            @RequestBody SponsorshipAdminDecisionDTO dto) {

        SponsorshipRequest req = sponsorshipRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Demande introuvable"));

        req.setStatut(SponsorshipRequestStatus.APPROVED);
        req.setDecisionNotes(dto.getNotes());

        sponsorshipRequestRepository.save(req);

        return ResponseEntity.ok().build();
    }

    // =========================
    // REJECT
    // =========================
    @PostMapping("/{id}/reject")
    public ResponseEntity<?> reject(
            @PathVariable Long id,
            @RequestBody SponsorshipAdminDecisionDTO dto) {

        SponsorshipRequest req = sponsorshipRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Demande introuvable"));

        req.setStatut(SponsorshipRequestStatus.REJECTED);
        req.setDecisionNotes(dto.getNotes());

        sponsorshipRequestRepository.save(req);

        return ResponseEntity.ok().build();
    }
}