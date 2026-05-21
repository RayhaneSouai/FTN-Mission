package tn.federation.backend.dto;

import java.util.List;

public record ProgrammeStatusResponse(
        Long competitionId,
        int totalDaysRequired,
        int daysCreated,
        boolean programGenerated,
        String programmeStatus,
        List<ProgrammeDayResponse> days) {
}
