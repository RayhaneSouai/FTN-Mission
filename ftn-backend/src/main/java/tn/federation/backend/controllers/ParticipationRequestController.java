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
import tn.federation.backend.repositories.LicenseRepository;
import tn.federation.backend.repositories.ParticipationAuditRepository;
import tn.federation.backend.repositories.ParticipationRepository;
import tn.federation.backend.repositories.PerformanceRepository;
import tn.federation.backend.repositories.UserRepository;
import tn.federation.backend.utils.AgeCategoryUtil;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.List;
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

        @Autowired
        private PerformanceRepository performanceRepository;

        @Autowired
        private LicenseRepository licenseRepository;

        @Autowired
        private ParticipationAuditRepository auditRepository;

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
                                        .body(Map.of("message", "Seuls les nageurs peuvent demander une participation",
                                                        "status", 400));
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
                                                        "La date limite d'inscription est dépassée ("
                                                                        + competition.getParticipationDeadline()
                                                                        + ").",
                                                        "status", 400));
                }

                // ─── Structured Participation Rules Validation ───

                // Gender check
                if (competition.getAllowedGender() != null && swimmer.getGender() != null
                                && swimmer.getGender() != competition.getAllowedGender()) {
                        return ResponseEntity.badRequest()
                                        .body(Map.of("message",
                                                        "Cette compétition est réservée aux : "
                                                                        + competition.getAllowedGender().name(),
                                                        "status", 400));
                }

                // Age check (raw min/max)
                if (swimmer.getBirthDate() != null && competition.getStartDate() != null) {
                        int age = Period.between(swimmer.getBirthDate(), competition.getStartDate()).getYears();
                        if (competition.getMinAge() != null && age < competition.getMinAge()) {
                                return ResponseEntity.badRequest()
                                                .body(Map.of("message",
                                                                "Âge minimum requis : " + competition.getMinAge()
                                                                                + " ans. Votre âge : " + age
                                                                                + " ans.",
                                                                "status", 400));
                        }
                        if (competition.getMaxAge() != null && age > competition.getMaxAge()) {
                                return ResponseEntity.badRequest()
                                                .body(Map.of("message",
                                                                "Âge maximum autorisé : " + competition.getMaxAge()
                                                                                + " ans. Votre âge : " + age
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
                                        .body(Map.of("message",
                                                        "Vous avez déjà soumis une demande pour cette compétition",
                                                        "status", 400));
                }

                // ─── License Check ───
                if (Boolean.TRUE.equals(competition.getLicenseRequired())) {
                        License license = swimmer.getLicense();
                        if (license == null || license.getId() == null) {
                                return ResponseEntity.badRequest()
                                                .body(Map.of("message",
                                                                "Une licence est obligatoire pour participer à cette compétition. Vous n'avez aucune licence enregistrée.",
                                                                "status", 400));
                        }
                        if (!LicenseStatus.VALIDATED.equals(license.getValidationStatus())) {
                                String statusMsg = LicenseStatus.PENDING.equals(license.getValidationStatus())
                                                ? "Votre licence est en attente de validation."
                                                : "Votre licence a été refusée.";
                                return ResponseEntity.badRequest()
                                                .body(Map.of("message",
                                                                statusMsg + " Une licence validée est requise pour cette compétition.",
                                                                "status", 400));
                        }
                        if (license.getExpiryDate() != null && license.getExpiryDate().isBefore(LocalDate.now())) {
                                return ResponseEntity.badRequest()
                                                .body(Map.of("message",
                                                                "Votre licence est expirée (date d'expiration : "
                                                                                + license.getExpiryDate()
                                                                                + "). Veuillez renouveler votre licence.",
                                                                "status", 400));
                        }
                }

                // ─── Minimas Check ───
                if (Boolean.TRUE.equals(competition.getHasMinimas())
                                && competition.getMinimaTime() != null) {
                        List<Performance> personalRecords = performanceRepository
                                        .findPersonalRecordsBySwimmer(swimmer.getId());
                        Optional<Double> bestTime = personalRecords.stream()
                                        .map(Performance::getTime)
                                        .filter(t -> t != null)
                                        .min(Double::compareTo);

                        String rejectionReason = null;
                        if (bestTime.isEmpty()) {
                                rejectionReason = "Aucune performance enregistrée. Un temps homologué est requis pour cette compétition.";
                        } else if (bestTime.get() > competition.getMinimaTime()) {
                                rejectionReason = "Votre meilleur temps (" + bestTime.get()
                                                + "s) ne satisfait pas le minima requis ("
                                                + competition.getMinimaTime() + "s).";
                        }

                        if (rejectionReason != null) {
                                // Create participation with REJECTED status
                                Participation rejected = new Participation();
                                rejected.setSwimmer(swimmer);
                                rejected.setCompetition(competition);
                                rejected.setStatus(ParticipationRequestStatus.REJECTED);
                                rejected.setRejectionReason(rejectionReason);
                                rejected.setRegisteredAt(LocalDateTime.now());
                                Participation savedRejected = participationRepository.save(rejected);

                                // Audit
                                ParticipationAudit auditRejected = new ParticipationAudit();
                                auditRejected.setSwimmerId(swimmer.getId());
                                auditRejected.setSwimmerName(swimmer.getFirstName() + " " + swimmer.getLastName());
                                auditRejected.setCompetitionId(competition.getId());
                                auditRejected.setCompetitionName(competition.getName());
                                auditRejected.setDecision(ParticipationRequestStatus.REJECTED);
                                auditRejected.setReason(rejectionReason);
                                auditRejected.setDecidedAt(LocalDateTime.now());
                                auditRepository.save(auditRejected);

                                return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(savedRejected));
                        }
                }

                // ─── Create Participation (APPROVED) ───

                // ─── Create Participation (APPROVED) ───
                Participation participation = new Participation();
                participation.setSwimmer(swimmer);
                participation.setCompetition(competition);
                participation.setStatus(ParticipationRequestStatus.APPROVED);
                participation.setRejectionReason(null);
                participation.setRegisteredAt(LocalDateTime.now());

                Participation saved = participationRepository.save(participation);

                // Persist audit log
                ParticipationAudit audit = new ParticipationAudit();
                audit.setSwimmerId(swimmer.getId());
                audit.setSwimmerName(swimmer.getFirstName() + " " + swimmer.getLastName());
                audit.setCompetitionId(competition.getId());
                audit.setCompetitionName(competition.getName());
                audit.setDecision(ParticipationRequestStatus.APPROVED);
                audit.setReason(null);
                audit.setDecidedAt(LocalDateTime.now());
                auditRepository.save(audit);

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
                                p.getRejectionReason());
        }
}
