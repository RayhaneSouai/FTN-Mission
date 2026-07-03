package tn.federation.backend.dto;

public record ClubRequirementItem(
        String key,
        String label,
        String expected,
        String actual,
        boolean met,
        boolean manualReview
) {}
