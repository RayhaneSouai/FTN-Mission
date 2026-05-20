package tn.federation.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tn.federation.backend.dto.CompetitionDetailDTO;
import tn.federation.backend.dto.ParticipationResponseDTO;
import tn.federation.backend.entities.Competition;
import tn.federation.backend.entities.Participation;
import tn.federation.backend.entities.ParticipationRequestStatus;
import tn.federation.backend.entities.User;
import tn.federation.backend.repositories.ParticipationRepository;
import tn.federation.backend.repositories.UserRepository;
import tn.federation.backend.services.Abstraction.ICompetitionService;

import java.util.List;
import java.util.Optional;

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
                        p.getCompetition().getCustomConditions()))
                .toList();
    }
}