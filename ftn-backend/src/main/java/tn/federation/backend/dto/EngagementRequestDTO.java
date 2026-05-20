package tn.federation.backend.dto;

/**
 * Requête de demande d'engagement d'un nageur sur une épreuve.
 */
public record EngagementRequestDTO(
        Long eventId,
        Double entryTime // temps d'engagement déclaré (secondes), null si NT
) {
}
