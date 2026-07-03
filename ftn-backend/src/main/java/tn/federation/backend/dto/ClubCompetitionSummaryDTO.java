package tn.federation.backend.dto;

import tn.federation.backend.entities.Competition;

import java.time.LocalDate;

public record ClubCompetitionSummaryDTO(
        Long id,
        String name,
        LocalDate startDate,
        LocalDate endDate,
        String region,
        String discipline,
        long engagementCount
) {
    public static ClubCompetitionSummaryDTO from(Competition competition, long engagementCount) {
        return new ClubCompetitionSummaryDTO(
                competition.getId(),
                competition.getName(),
                competition.getStartDate(),
                competition.getEndDate(),
                competition.getRegion() != null ? competition.getRegion().name() : null,
                competition.getDiscipline() != null ? competition.getDiscipline().name() : null,
                engagementCount
        );
    }
}
