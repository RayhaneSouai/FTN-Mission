package tn.federation.backend.dto;

import java.time.LocalDateTime;

/**
 * Réponse détaillée d'un engagement.
 */
public record EngagementResponseDTO(
        Long id,
        Long swimmerId,
        String swimmerFirstName,
        String swimmerLastName,
        Long eventId,
        String eventName,
        Long competitionId,
        String competitionName,
        String clubName,
        Double entryTime,
        String status,
        LocalDateTime requestedAt,
        LocalDateTime validatedAt,
        String rejectionReason) {
}
