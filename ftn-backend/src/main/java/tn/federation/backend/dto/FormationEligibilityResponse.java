package tn.federation.backend.dto;

public record FormationEligibilityResponse(
        boolean eligible,
        String explanation
) {}
