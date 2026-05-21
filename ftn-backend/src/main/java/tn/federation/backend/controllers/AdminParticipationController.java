package tn.federation.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.federation.backend.dto.ParticipationResponseDTO;
import tn.federation.backend.entities.Participation;
import tn.federation.backend.entities.ParticipationRequestStatus;
import tn.federation.backend.repositories.ParticipationRepository;

import java.util.List;
import java.util.Map;

/**
 * Admin endpoint to manage participation requests (approve/reject).
 * Secured via SecurityConfig (/api/admin/** requires authentication).
 */
@RestController
@RequestMapping("/api/admin/participations")
public class AdminParticipationController {

    @Autowired
    private ParticipationRepository participationRepository;

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
        participationRepository.save(p);
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
        participationRepository.save(p);
        return ResponseEntity.ok(toDTO(p));
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
                p.getCompetition().getCustomConditions());
    }
}
