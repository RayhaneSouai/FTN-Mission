package tn.federation.backend.dto;

import java.util.List;

public record ClubJoinPreviewDTO(
        List<ClubRequirementItem> requirements,
        int criteriaMet,
        int criteriaTotal,
        int eligibilityScore,
        String predictedStatus,
        String predictedLabel,
        String summary
) {}
