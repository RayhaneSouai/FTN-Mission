package tn.federation.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import tn.federation.backend.entities.Competition;
import tn.federation.backend.services.Abstraction.ICompetitionService;

import java.util.List;

@RestController
@RequestMapping("/api/competitions")
@CrossOrigin("*") // utile pour Angular
public class CompetitionController {

    @Autowired
    ICompetitionService competitionService;

    // ✅ CREATE
    @PostMapping("/add")
    public Competition addCompetition(@RequestBody Competition competition) {
        return competitionService.addCompetition(competition);
    }

    // ✅ UPDATE
    @PutMapping("/update")
    public Competition updateCompetition(@RequestBody Competition competition) {
        return competitionService.updateCompetition(competition);
    }

    // ✅ DELETE
    @DeleteMapping("/delete/{id}")
    public void deleteCompetition(@PathVariable long id) {
        competitionService.deleteCompetition(id);
    }

    // ✅ GET BY ID
    @GetMapping("/get/{id}")
    public Competition getCompetitionById(@PathVariable long id) {
        return competitionService.getCompetitionById(id);
    }

    // ✅ GET ALL
    @GetMapping("/getAll")
    public List<Competition> getAllCompetitions() {
        return competitionService.getAllCompetitions();
    }
}