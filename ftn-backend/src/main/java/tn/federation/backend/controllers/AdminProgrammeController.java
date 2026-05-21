package tn.federation.backend.controllers;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import tn.federation.backend.dto.*;
import tn.federation.backend.services.Abstraction.IProgrammeService;

import java.util.List;

/**
 * Backoffice controller for full programme CRUD (admin only).
 * Requires authentication (not in public permit list).
 */
@RestController
@RequestMapping("/api/admin/competitions/{competitionId}/programme")
public class AdminProgrammeController {

    @Autowired
    private IProgrammeService programmeService;

    @GetMapping("/status")
    public ProgrammeStatusResponse getProgrammeStatus(@PathVariable Long competitionId) {
        return programmeService.getProgrammeStatus(competitionId);
    }

    @PostMapping("/generate")
    @ResponseStatus(HttpStatus.CREATED)
    public ProgrammeStatusResponse generateProgramme(@PathVariable Long competitionId) {
        return programmeService.generateProgramme(competitionId);
    }

    @PostMapping("/days/{dayId}/items")
    @ResponseStatus(HttpStatus.CREATED)
    public ProgramItemResponse addProgramItem(@PathVariable Long competitionId,
            @PathVariable Long dayId,
            @Valid @RequestBody ProgramItemRequest request) {
        return programmeService.addProgramItem(dayId, request);
    }

    @PutMapping("/items/{itemId}")
    public ProgramItemResponse updateProgramItem(@PathVariable Long competitionId,
            @PathVariable Long itemId,
            @Valid @RequestBody ProgramItemRequest request) {
        return programmeService.updateProgramItem(itemId, request);
    }

    @DeleteMapping("/items/{itemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProgramItem(@PathVariable Long competitionId, @PathVariable Long itemId) {
        programmeService.deleteProgramItem(itemId);
    }

    @GetMapping("/series")
    public List<ProgramItemResponse> getSeriesItems(@PathVariable Long competitionId) {
        return programmeService.getSeriesItems(competitionId);
    }

    @PutMapping("/approve")
    public ProgrammeStatusResponse approveProgramme(@PathVariable Long competitionId) {
        return programmeService.approveProgramme(competitionId);
    }
}
