package tn.federation.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tn.federation.backend.dto.ParticipationResponseDTO;
import tn.federation.backend.entities.*;
import tn.federation.backend.entities.ParticipationRequestStatus;
import tn.federation.backend.repositories.CompetitionRepository;
import tn.federation.backend.repositories.ParticipationRepository;
import tn.federation.backend.repositories.UserRepository;
import tn.federation.backend.utils.AgeCategoryUtil;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.Map;
import java.util.Optional;

/**
 * Swimmer-facing endpoint to submit a participation request.
 * Requires authentication (JWT).
 */
@RestController
@RequestMapping("/api/competitions")
public class ParticipationRequestController {

    @Autowired
    private ParticipationRepository participationRepository;

    @Autowired
    private CompetitionRepository competitionRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * POST /api/competitions/{competitionId}/participate
     * Creates a new participation request with status EN_ATTENTE.
     */
    @PostMapping("/{competitionId}/participate")
    public ResponseEntity<?> requestParticipation(
            @PathVariable Long competitionId,
            Authentication authentication) {

        String email = authentication.getName();
        User swimmer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (swimmer.getRole() != Role.SWIMMER) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Seuls les nageurs peuvent demander une participation", "status", 400));
        }

        Competition competition = competitionRepository.findById(competitionId)
                .orElseThrow(() -> new RuntimeException("Compétition non trouvée"));

        // A swimmer cannot participate if no approved programme exists
        if (competition.getProgrammeStatus() == null
                || competition.getProgrammeStatus() != ProgrammeStatus.APPROVED) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "Impossible de participer : aucun programme n'a été publié pour cette compétition.",
                            "status", 400));
        }

        // ─── Deadline Check ───
        if (competition.getParticipationDeadline() != null
                && LocalDate.now().isAfter(competition.getParticipationDeadline())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "La date limite d'inscription est dépassée (" + competition.getParticipationDeadline()
                                    + ").",
                            "status", 400));
        }

        // ─── Structured Participation Rules Validation ───

        // Gender check
        if (competition.getAllowedGender() != null && swimmer.getGender() != null
                && swimmer.getGender() != competition.getAllowedGender()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "Cette compétition est réservée aux : " + competition.getAllowedGender().name(),
                            "status", 400));
        }

        // Age check (raw min/max)
        if (swimmer.getBirthDate() != null && competition.getStartDate() != null) {
            int age = Period.between(swimmer.getBirthDate(), competition.getStartDate()).getYears();
            if (competition.getMinAge() != null && age < competition.getMinAge()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message",
                                "Âge minimum requis : " + competition.getMinAge() + " ans. Votre âge : " + age
                                        + " ans.",
                                "status", 400));
            }
            if (competition.getMaxAge() != null && age > competition.getMaxAge()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message",
                                "Âge maximum autorisé : " + competition.getMaxAge() + " ans. Votre âge : " + age
                                        + " ans.",
                                "status", 400));
            }
        }

        // ─── Age Category Check ───
        if (competition.getAllowedCategories() != null && !competition.getAllowedCategories().isEmpty()
                && swimmer.getBirthDate() != null && competition.getStartDate() != null) {
            Categorie swimmerCategory = AgeCategoryUtil.determineCategory(
                    swimmer.getBirthDate(), competition.getStartDate());
            if (!AgeCategoryUtil.isCategoryAllowed(swimmerCategory, competition.getAllowedCategories())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message",
                                "Votre catégorie d'âge (" + swimmerCategory.name()
                                        + ") n'est pas éligible pour cette compétition.",
                                "status", 400));
            }
        }

        // Check for duplicate
        Optional<Participation> existing = participationRepository
                .findBySwimmerIdAndCompetitionId(swimmer.getId(), competitionId);
        if (existing.isPresent()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Vous avez déjà soumis une demande pour cette compétition", "status", 400));
        }

        Participation participation = new Participation();
        participation.setSwimmer(swimmer);
        participation.setCompetition(competition);
        participation.setStatus(ParticipationRequestStatus.PENDING);
        participation.setRegisteredAt(LocalDateTime.now());

        Participation saved = participationRepository.save(participation);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(saved));
    }

    /**
     * GET /api/competitions/{competitionId}/my-participation
     * Check if the current swimmer already has a participation request.
     */
    @GetMapping("/{competitionId}/my-participation")
    public ResponseEntity<?> getMyParticipation(
            @PathVariable Long competitionId,
            Authentication authentication) {

        String email = authentication.getName();
        User swimmer = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Optional<Participation> existing = participationRepository
                .findBySwimmerIdAndCompetitionId(swimmer.getId(), competitionId);

        if (existing.isPresent()) {
            return ResponseEntity.ok(toDTO(existing.get()));
        }
        return ResponseEntity.ok(null);
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
