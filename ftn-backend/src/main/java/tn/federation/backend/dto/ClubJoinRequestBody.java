package tn.federation.backend.dto;

public record ClubJoinRequestBody(
        String message,
        String motivationLetter,
        String currentLevel,
        String previousClub,
        String availability
) {
    public static ClubJoinRequestBody empty() {
        return new ClubJoinRequestBody(null, null, null, null, null);
    }
}
