package tn.federation.backend.dto;

import java.util.List;

/**
 * Résultat de vérification d'éligibilité d'un nageur pour une épreuve.
 */
public record EligibilityDTO(
        Long eventId,
        String eventName,
        boolean eligible,
        List<String> reasons // raisons de non-éligibilité (vide si éligible)
) {
}
