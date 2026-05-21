package tn.federation.backend.dto;

public record ParticipantDTO(
        Long id,
        int lane,
        Long swimmerId,
        String swimmerFirstName,
        String swimmerLastName,
        String birthDate,
        String gender,
        String club,
        String entryTime) {
}
