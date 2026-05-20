package tn.federation.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import tn.federation.backend.dto.EligibilityDTO;
import tn.federation.backend.dto.EngagementRequestDTO;
import tn.federation.backend.dto.EngagementResponseDTO;
import tn.federation.backend.services.Abstraction.IEngagementService;

import java.util.List;

/**
 * Endpoints pour la gestion des engagements (participations) aux épreuves.
 */
@RestController
@RequestMapping("/api/competitions/{competitionId}/engagements")
public class EngagementController {

    @Autowired
    private IEngagementService engagementService;

    // ─── Swimmer endpoints ───

    /** Nageur: demander un engagement */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EngagementResponseDTO requestEngagement(
            @PathVariable Long competitionId,
            @RequestBody EngagementRequestDTO request) {
        return engagementService.requestEngagement(getCurrentEmail(), competitionId, request);
    }

    /** Nageur: vérifier son éligibilité pour toutes les épreuves */
    @GetMapping("/eligibility")
    public List<EligibilityDTO> checkEligibility(@PathVariable Long competitionId) {
        return engagementService.checkEligibility(getCurrentEmail(), competitionId);
    }

    /** Nageur: vérifier son éligibilité pour une épreuve spécifique */
    @GetMapping("/eligibility/{eventId}")
    public EligibilityDTO checkEventEligibility(
            @PathVariable Long competitionId,
            @PathVariable Long eventId) {
        return engagementService.checkEventEligibility(getCurrentEmail(), competitionId, eventId);
    }

    /** Nageur: voir ses engagements */
    @GetMapping("/mine")
    public List<EngagementResponseDTO> getMyEngagements(@PathVariable Long competitionId) {
        return engagementService.getSwimmerEngagements(getCurrentEmail(), competitionId);
    }

    // ─── Club endpoints ───

    /** Club: voir les engagements de ses nageurs */
    @GetMapping("/club/{clubId}")
    public List<EngagementResponseDTO> getClubEngagements(
            @PathVariable Long competitionId,
            @PathVariable Long clubId) {
        return engagementService.getClubEngagements(clubId, competitionId);
    }

    /** Club: valider un engagement */
    @PutMapping("/{engagementId}/validate")
    public EngagementResponseDTO validateEngagement(
            @PathVariable Long competitionId,
            @PathVariable Long engagementId) {
        return engagementService.validateEngagement(engagementId);
    }

    /** Club: refuser un engagement */
    @PutMapping("/{engagementId}/reject")
    public EngagementResponseDTO rejectEngagement(
            @PathVariable Long competitionId,
            @PathVariable Long engagementId,
            @RequestBody(required = false) String reason) {
        return engagementService.rejectEngagement(engagementId, reason);
    }

    // ─── Admin endpoints ───

    /** Admin: voir tous les engagements d'une compétition */
    @GetMapping
    public List<EngagementResponseDTO> getAllEngagements(@PathVariable Long competitionId) {
        return engagementService.getCompetitionEngagements(competitionId);
    }

    /** Admin: confirmer un engagement */
    @PutMapping("/{engagementId}/confirm")
    public EngagementResponseDTO confirmEngagement(
            @PathVariable Long competitionId,
            @PathVariable Long engagementId) {
        return engagementService.confirmEngagement(engagementId);
    }

    private String getCurrentEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getName();
    }
}
