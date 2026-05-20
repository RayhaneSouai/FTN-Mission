package tn.federation.backend.services.Abstraction;

import tn.federation.backend.dto.*;
import tn.federation.backend.entities.CompetitionDay;
import tn.federation.backend.entities.CompetitionEvent;
import tn.federation.backend.entities.EventSeries;
import tn.federation.backend.entities.SeriesParticipant;

import java.util.List;

public interface IProgrammeService {

    // ===== NEW API (flat ProgramItem model) =====

    /** Get programme status including auto-generated days */
    ProgrammeStatusResponse getProgrammeStatus(Long competitionId);

    /** Generate all days automatically based on competition dates */
    ProgrammeStatusResponse generateProgramme(Long competitionId);

    /** Add a program item to a specific day */
    ProgramItemResponse addProgramItem(Long dayId, ProgramItemRequest request);

    /** Update a program item */
    ProgramItemResponse updateProgramItem(Long itemId, ProgramItemRequest request);

    /** Delete a program item */
    void deleteProgramItem(Long itemId);

    /** Get only SERIES items for participants tab */
    List<ProgramItemResponse> getSeriesItems(Long competitionId);

    /** Approve a DRAFT programme → APPROVED */
    ProgrammeStatusResponse approveProgramme(Long competitionId);

    /** Get programme for public view (only if APPROVED) */
    ProgrammeStatusResponse getApprovedProgramme(Long competitionId);

    // ===== LEGACY API =====
    List<ProgrammeDayDTO> getProgrammeByCompetitionId(Long competitionId);

    CompetitionDay addDay(Long competitionId, CompetitionDay day);

    CompetitionDay updateDay(Long dayId, CompetitionDay day);

    void deleteDay(Long dayId);

    CompetitionEvent addEvent(Long dayId, CompetitionEvent event);

    CompetitionEvent updateEvent(Long eventId, CompetitionEvent event);

    void deleteEvent(Long eventId);

    EventSeries addSeries(Long eventId, EventSeries series);

    void deleteSeries(Long seriesId);

    SeriesParticipant addParticipant(Long seriesId, Long swimmerId, int lane, String entryTime);

    void deleteParticipant(Long participantId);

    List<ParticipantDTO> getAllParticipantsByCompetitionId(Long competitionId);
}
