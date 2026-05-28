package tn.federation.backend.services.Abstraction;

import tn.federation.backend.dto.EligibilityDTO;
import tn.federation.backend.dto.EngagementRequestDTO;
import tn.federation.backend.dto.EngagementResponseDTO;

import java.util.List;

public interface IEngagementService {

    /** Nageur: demander un engagement sur une épreuve */
    EngagementResponseDTO requestEngagement(String swimmerEmail, Long competitionId, EngagementRequestDTO request);

    /**
     * Vérifier l'éligibilité d'un nageur pour toutes les épreuves d'une compétition
     */
    List<EligibilityDTO> checkEligibility(String swimmerEmail, Long competitionId);

    /** Vérifier l'éligibilité d'un nageur pour une épreuve spécifique */
    EligibilityDTO checkEventEligibility(String swimmerEmail, Long competitionId, Long eventId);

    /** Récupérer les engagements d'un nageur pour une compétition */
    List<EngagementResponseDTO> getSwimmerEngagements(String swimmerEmail, Long competitionId);

    /** Club: valider un engagement */
    EngagementResponseDTO validateEngagement(Long engagementId);

    /** Club: refuser un engagement */
    EngagementResponseDTO rejectEngagement(Long engagementId, String reason);

    /** Admin: confirmer un engagement */
    EngagementResponseDTO confirmEngagement(Long engagementId);

    /** Récupérer tous les engagements d'une compétition */
    List<EngagementResponseDTO> getCompetitionEngagements(Long competitionId);

    /** Récupérer les engagements d'un club pour une compétition */
    List<EngagementResponseDTO> getClubEngagements(Long clubId, Long competitionId);
}
