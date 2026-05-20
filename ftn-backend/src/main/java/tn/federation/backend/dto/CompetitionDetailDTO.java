package tn.federation.backend.dto;

import tn.federation.backend.entities.Competition;

/**
 * Wraps a Competition entity with the current user's participation status.
 * participationStatus is null/"NONE" when user is not authenticated or has no
 * request.
 */
public class CompetitionDetailDTO {
    private Competition competition;
    private String participationStatus; // PENDING, APPROVED, REJECTED, or NONE

    public CompetitionDetailDTO(Competition competition, String participationStatus) {
        this.competition = competition;
        this.participationStatus = participationStatus;
    }

    public Competition getCompetition() {
        return competition;
    }

    public void setCompetition(Competition competition) {
        this.competition = competition;
    }

    public String getParticipationStatus() {
        return participationStatus;
    }

    public void setParticipationStatus(String participationStatus) {
        this.participationStatus = participationStatus;
    }
}
