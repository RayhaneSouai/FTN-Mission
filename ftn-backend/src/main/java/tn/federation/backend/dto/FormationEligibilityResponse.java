package tn.federation.backend.dto;

/**
 * @deprecated Only used by the deprecated Claude-backed EligibilityService.
 * The live pipeline returns {@link AiEligibilityResponse} instead.
 */
@Deprecated
public record FormationEligibilityResponse(
        boolean eligible,
        String explanation
) {}
