package tn.federation.backend.dto;

import tn.federation.backend.entities.ClubJoinRequest;

import java.time.LocalDateTime;

public record ClubJoinRequestDTO(
        Long id,
        Long swimmerId,
        String swimmerName,
        String swimmerEmail,
        Long clubId,
        String clubName,
        String clubRegion,
        String status,
        LocalDateTime requestedAt
) {
    public static ClubJoinRequestDTO fromEntity(ClubJoinRequest request) {
        var swimmer = request.getSwimmer();
        var club = request.getClub();
        String swimmerName = (swimmer.getFirstName() + " " + swimmer.getLastName()).trim();
        return new ClubJoinRequestDTO(
                request.getId(),
                swimmer.getId(),
                swimmerName,
                swimmer.getEmail(),
                club.getId(),
                club.getName(),
                club.getRegion(),
                request.getStatus().name(),
                request.getRequestedAt()
        );
    }
}
