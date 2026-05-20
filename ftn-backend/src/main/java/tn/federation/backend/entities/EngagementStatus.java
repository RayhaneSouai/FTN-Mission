package tn.federation.backend.entities;

/**
 * Statut d'un engagement (participation) à une épreuve.
 * Flux : DEMANDE → VALIDEE_CLUB → CONFIRMEE | REFUSEE
 */
public enum EngagementStatus {
    DEMANDE,
    VALIDEE_CLUB,
    CONFIRMEE,
    REFUSEE
}
