package tn.federation.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tn.federation.backend.dto.CompetitionDetailDTO;
import tn.federation.backend.dto.DistributionResponseDTO;
import tn.federation.backend.dto.ParticipationResponseDTO;
import tn.federation.backend.entities.*;
import tn.federation.backend.repositories.*;
import tn.federation.backend.services.Abstraction.ICompetitionService;
import tn.federation.backend.services.Abstraction.IDistributionService;

import java.util.*;

/**
 * Public controller — read-only, returns approved/public competition data.
 */
@RestController
@RequestMapping("/api/competitions")
public class CompetitionController {

    @Autowired
    ICompetitionService competitionService;

    @Autowired
    private ParticipationRepository participationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private IDistributionService distributionService;

    @Autowired
    private MediaItemRepository mediaItemRepository;

    @Autowired
    private MediaCommentRepository mediaCommentRepository;

    @GetMapping("/get/{id}")
    public CompetitionDetailDTO getCompetitionById(
            @PathVariable long id,
            Authentication authentication) {

        Competition competition = competitionService.getCompetitionById(id);

        String participationStatus = "NONE";
        if (authentication != null) {
            Optional<User> userOpt = userRepository.findByEmail(authentication.getName());
            if (userOpt.isPresent()) {
                Optional<Participation> existing = participationRepository
                        .findBySwimmerIdAndCompetitionId(userOpt.get().getId(), id);
                if (existing.isPresent()) {
                    participationStatus = existing.get().getStatus().name();
                }
            }
        }

        return new CompetitionDetailDTO(competition, participationStatus);
    }

    @GetMapping("/getAll")
    public List<Competition> getAllCompetitions() {
        return competitionService.getAllCompetitions();
    }

    @GetMapping
    public List<Competition> getAllCompetitionsRest() {
        return competitionService.getAllCompetitions();
    }

    @GetMapping("/{id}/participants")
    public List<ParticipationResponseDTO> getApprovedParticipants(@PathVariable Long id) {
        return participationRepository.findByCompetitionIdAndStatus(id, ParticipationRequestStatus.APPROVED)
                .stream()
                .map(p -> new ParticipationResponseDTO(
                        p.getId(),
                        p.getSwimmer().getId(),
                        p.getSwimmer().getFirstName(),
                        p.getSwimmer().getLastName(),
                        p.getCompetition().getId(),
                        p.getCompetition().getName(),
                        p.getStatus().name(),
                        p.getRegisteredAt() != null ? p.getRegisteredAt().toString() : null,
                        p.getRejectionReason()))
                .toList();
    }

    @GetMapping("/{id}/distribution")
    public ResponseEntity<DistributionResponseDTO> getApprovedDistribution(@PathVariable Long id) {
        DistributionResponseDTO result = distributionService.getApprovedDistribution(id);
        if (result == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(result);
    }

    // =====================================================================
    // MEDIA & COMMENTAIRES MEDIA
    // =====================================================================

    /** Liste des médias d'une compétition */
    @GetMapping("/{id}/media")
    public ResponseEntity<List<MediaItem>> getMediaByCompetition(@PathVariable Long id) {
        List<MediaItem> items = mediaItemRepository.findByCompetitionId(id);
        return ResponseEntity.ok(items);
    }

    /** Commentaires d'un média */
    @GetMapping("/{compId}/media/{mediaId}/comments")
    public ResponseEntity<List<Map<String, Object>>> getMediaComments(
            @PathVariable Long compId,
            @PathVariable Long mediaId) {
        List<MediaComment> comments = mediaCommentRepository.findByMediaItemIdOrderByCreatedAtAsc(mediaId);
        List<Map<String, Object>> result = comments.stream().map(c -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", c.getId());
            map.put("text", c.getText());
            map.put("createdAt", c.getCreatedAt());
            if (c.getUser() != null) {
                map.put("userName", c.getUser().getFirstName() + " " + c.getUser().getLastName());
                map.put("userInitials", c.getUser().getFirstName().substring(0, 1).toUpperCase() +
                        c.getUser().getLastName().substring(0, 1).toUpperCase());
                map.put("userId", c.getUser().getId());
            }
            return map;
        }).toList();
        return ResponseEntity.ok(result);
    }

    /** Ajouter un commentaire sur un média */
    @PostMapping("/{compId}/media/{mediaId}/comments")
    public ResponseEntity<?> addMediaComment(
            @PathVariable Long compId,
            @PathVariable Long mediaId,
            @RequestParam Long userId,
            @RequestBody Map<String, String> payload) {
        try {
            Optional<MediaItem> mediaOpt = mediaItemRepository.findById(mediaId);
            Optional<User> userOpt = userRepository.findById(userId);
            if (mediaOpt.isEmpty() || userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("Média ou utilisateur introuvable");
            }
            MediaComment comment = MediaComment.builder()
                    .text(payload.get("text"))
                    .user(userOpt.get())
                    .mediaItem(mediaOpt.get())
                    .build();
            mediaCommentRepository.save(comment);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erreur: " + e.getMessage());
        }
    }
}