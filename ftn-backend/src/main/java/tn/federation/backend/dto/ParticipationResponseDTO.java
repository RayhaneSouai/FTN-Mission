package tn.federation.backend.dto;

public record ParticipationResponseDTO(
                Long id,
                Long swimmerId,
                String swimmerFirstName,
                String swimmerLastName,
                Long competitionId,
                String competitionName,
                String status,
                String requestedAt,
                String rejectionReason) {
}
