package tn.federation.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.federation.backend.dto.ParticipationResponseDTO;
import tn.federation.backend.entities.Participation;
import tn.federation.backend.entities.ParticipationAudit;
import tn.federation.backend.entities.ParticipationRequestStatus;
import tn.federation.backend.repositories.ParticipationAuditRepository;
import tn.federation.backend.repositories.ParticipationRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Admin endpoint to manage participation requests and audit trail.
 */
@RestController
@RequestMapping("/api/admin/participations")
public class AdminParticipationController {

    @Autowired
    private ParticipationRepository participationRepository;

    @Autowired
    private ParticipationAuditRepository auditRepository;

    /** GET /api/admin/participations/pending — all pending requests */
    @GetMapping("/pending")
    public List<ParticipationResponseDTO> getPendingRequests() {
        return participationRepository.findByStatus(ParticipationRequestStatus.PENDING)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    /** GET /api/admin/participations — all requests */
    @GetMapping
    public List<ParticipationResponseDTO> getAllRequests() {
        return participationRepository.findAll()
                .stream()
                .map(this::toDTO)
                .toList();
    }

    /** PUT /api/admin/participations/{id}/approve */
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Long id) {
        Participation p = participationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        if (p.getStatus() != ParticipationRequestStatus.PENDING) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Cette demande a déjà été traitée", "status", 400));
        }

        p.setStatus(ParticipationRequestStatus.APPROVED);
        p.setRejectionReason(null);
        participationRepository.save(p);

        // Audit log
        saveAudit(p, null);

        return ResponseEntity.ok(toDTO(p));
    }

    /** PUT /api/admin/participations/{id}/reject */
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Long id) {
        Participation p = participationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        if (p.getStatus() != ParticipationRequestStatus.PENDING) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Cette demande a déjà été traitée", "status", 400));
        }

        p.setStatus(ParticipationRequestStatus.REJECTED);
        p.setRejectionReason("Inscription refusée par la fédération.");
        participationRepository.save(p);

        // Audit log
        saveAudit(p, p.getRejectionReason());

        return ResponseEntity.ok(toDTO(p));
    }

    // ─── Audit Endpoints ───

    /** GET /api/admin/participations/audit — full audit trail */
    @GetMapping("/audit")
    public List<ParticipationAudit> getAuditTrail() {
        return auditRepository.findAllByOrderByDecidedAtDesc();
    }

    /** GET /api/admin/participations/audit/swimmer/{swimmerId} */
    @GetMapping("/audit/swimmer/{swimmerId}")
    public List<ParticipationAudit> getAuditBySwimmer(@PathVariable Long swimmerId) {
        return auditRepository.findBySwimmerIdOrderByDecidedAtDesc(swimmerId);
    }

    /** GET /api/admin/participations/audit/competition/{competitionId} */
    @GetMapping("/audit/competition/{competitionId}")
    public List<ParticipationAudit> getAuditByCompetition(@PathVariable Long competitionId) {
        return auditRepository.findByCompetitionIdOrderByDecidedAtDesc(competitionId);
    }

    /** GET /api/admin/participations/audit/status/{status} */
    @GetMapping("/audit/status/{status}")
    public List<ParticipationAudit> getAuditByStatus(@PathVariable String status) {
        ParticipationRequestStatus s = ParticipationRequestStatus.valueOf(status.toUpperCase());
        return auditRepository.findByDecisionOrderByDecidedAtDesc(s);
    }

    // ─── Helpers ───

    private void saveAudit(Participation p, String reason) {
        ParticipationAudit audit = new ParticipationAudit();
        audit.setSwimmerId(p.getSwimmer().getId());
        audit.setSwimmerName(p.getSwimmer().getFirstName() + " " + p.getSwimmer().getLastName());
        audit.setCompetitionId(p.getCompetition().getId());
        audit.setCompetitionName(p.getCompetition().getName());
        audit.setDecision(p.getStatus());
        audit.setReason(reason);
        audit.setDecidedAt(LocalDateTime.now());
        auditRepository.save(audit);
    }

    private ParticipationResponseDTO toDTO(Participation p) {
        return new ParticipationResponseDTO(
                p.getId(),
                p.getSwimmer().getId(),
                p.getSwimmer().getFirstName(),
                p.getSwimmer().getLastName(),
                p.getCompetition().getId(),
                p.getCompetition().getName(),
                p.getStatus().name(),
                p.getRegisteredAt() != null ? p.getRegisteredAt().toString() : null,
                p.getRejectionReason());
    }
}
