package tn.federation.backend.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import tn.federation.backend.dto.PartnershipAdminDecisionDTO;
import tn.federation.backend.dto.SponsorshipAdminDecisionDTO;
import tn.federation.backend.entities.PartnershipRequest;
import tn.federation.backend.entities.PartnershipRequestStatus;
import tn.federation.backend.entities.SponsorshipRequest;
import tn.federation.backend.entities.SponsorshipRequestStatus;
import tn.federation.backend.repositories.PartnershipRequestRepository;

import java.util.List;

@RestController
@RequestMapping("/api/admin/partners")
public class AdminPartnershipController {

    private final PartnershipRequestRepository partnershipRequestRepository;

    public AdminPartnershipController(PartnershipRequestRepository partnershipRequestRepository) {
        this.partnershipRequestRepository = partnershipRequestRepository;
    }

    @GetMapping("/requests")
    public List<PartnershipRequest> listPendingPartnershipRequests() {
        return partnershipRequestRepository.findAll().stream()
                .filter(r -> r.getStatut() == PartnershipRequestStatus.PENDING)
                .toList();
    }

    @PostMapping("/requests/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Long id, @RequestBody PartnershipAdminDecisionDTO dto) {
        PartnershipRequest req = partnershipRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Demande introuvable"));
        req.setStatut(PartnershipRequestStatus.APPROVED);
        partnershipRequestRepository.save(req);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/requests/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Long id, @RequestBody PartnershipAdminDecisionDTO dto) {
        PartnershipRequest req = partnershipRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Demande introuvable"));
        req.setStatut(PartnershipRequestStatus.REJECTED);
        partnershipRequestRepository.save(req);
        return ResponseEntity.ok().build();
    }
}

