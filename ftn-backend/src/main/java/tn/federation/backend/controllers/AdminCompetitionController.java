package tn.federation.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import tn.federation.backend.entities.Competition;
import tn.federation.backend.services.Abstraction.ICompetitionService;

import java.util.List;

/**
 * Back-Office controller — full CRUD for competitions (admin only).
 * Secured via SecurityConfig (/api/admin/** requires authentication).
 */
@RestController
@RequestMapping("/api/admin/competitions")
public class AdminCompetitionController {

    @Autowired
    private ICompetitionService competitionService;

    @PostMapping("/add")
    @ResponseStatus(HttpStatus.CREATED)
    public Competition addCompetition(@RequestBody Competition competition) {
        return competitionService.addCompetition(competition);
    }

    @PutMapping("/update")
    public Competition updateCompetition(@RequestBody Competition competition) {
        return competitionService.updateCompetition(competition);
    }

    @DeleteMapping("/delete/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCompetition(@PathVariable long id) {
        competitionService.deleteCompetition(id);
    }

    @GetMapping("/getAll")
    public List<Competition> getAllCompetitions() {
        return competitionService.getAllCompetitions();
    }

    @GetMapping("/get/{id}")
    public Competition getCompetitionById(@PathVariable long id) {
        return competitionService.getCompetitionById(id);
    }
}
