package tn.federation.backend.dto;

/**
 * DTO pour les informations d'une épreuve enrichie avec les critères FTN.
 */
public record CompetitionEventDTO(
        Long id,
        int eventNumber,
        String eventName,
        String gender,
        String distance,
        String stroke,
        String requiredAgeCategory,
        String ageCategoryLabel,
        Double minimaTime,
        Integer maxParticipants,
        int currentEngagements) {
}
