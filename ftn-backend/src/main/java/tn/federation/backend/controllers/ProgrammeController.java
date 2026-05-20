package tn.federation.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import tn.federation.backend.dto.*;
import tn.federation.backend.services.Abstraction.IProgrammeService;

import java.util.List;

/**
 * Public controller — read-only, returns only APPROVED programmes.
 */
@RestController
@RequestMapping("/api/competitions/{competitionId}/programme")
public class ProgrammeController {

    @Autowired
    private IProgrammeService programmeService;

    /** Public: get programme only if APPROVED */
    @GetMapping
    public ProgrammeStatusResponse getApprovedProgramme(@PathVariable Long competitionId) {
        return programmeService.getApprovedProgramme(competitionId);
    }

    /** Public: get participants (legacy, kept for backward compat) */
    @GetMapping("/participants")
    public List<ParticipantDTO> getParticipants(@PathVariable Long competitionId) {
        return programmeService.getAllParticipantsByCompetitionId(competitionId);
    }
}
