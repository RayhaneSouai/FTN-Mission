package tn.federation.backend.dto;

public record AiEligibilityResponse(boolean eligible, String message, boolean error) {

    public AiEligibilityResponse(boolean eligible, String message) {
        this(eligible, message, false);
    }

    public static AiEligibilityResponse serviceError(String message) {
        return new AiEligibilityResponse(false, message, true);
    }

    public static AiEligibilityResponse unconfigured() {
        return new AiEligibilityResponse(true,
                "Service IA non configuré — la vérification manuelle sera effectuée par l'administration.",
                false);
    }
}
