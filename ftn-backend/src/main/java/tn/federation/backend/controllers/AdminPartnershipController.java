package tn.federation.backend.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.federation.backend.dto.PartnershipAdminDecisionDTO;
import tn.federation.backend.entities.PartnershipRequest;
import tn.federation.backend.entities.PartnershipRequestStatus;
import tn.federation.backend.repositories.PartnershipRequestRepository;

import java.util.List;

@RestController
@RequestMapping("/api/admin/partners/partnerships")
public class AdminPartnershipController {

    private final PartnershipRequestRepository partnershipRequestRepository;

    public AdminPartnershipController(PartnershipRequestRepository partnershipRequestRepository) {
        this.partnershipRequestRepository = partnershipRequestRepository;
    }

    // =========================
    // GET ALL (NOT ONLY PENDING)
    // =========================
    @GetMapping
    public List<PartnershipRequest> getAll() {
        return partnershipRequestRepository.findAll();
    }

    // =========================
    // APPROVE
    // =========================
    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approve(
            @PathVariable Long id,
            @RequestBody PartnershipAdminDecisionDTO dto) {

        PartnershipRequest req = partnershipRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Demande introuvable"));

        req.setStatut(PartnershipRequestStatus.APPROVED);
        req.setDecisionNotes(dto.getNotes());

        partnershipRequestRepository.save(req);

        return ResponseEntity.ok().build();
    }

    // =========================
    // REJECT
    // =========================
    @PostMapping("/{id}/reject")
    public ResponseEntity<?> reject(
            @PathVariable Long id,
            @RequestBody PartnershipAdminDecisionDTO dto) {

        PartnershipRequest req = partnershipRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Demande introuvable"));

        req.setStatut(PartnershipRequestStatus.REJECTED);
        req.setDecisionNotes(dto.getNotes());

        partnershipRequestRepository.save(req);

        return ResponseEntity.ok().build();
    }
}