package tn.federation.backend.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.federation.backend.entities.FormationProgram;
import tn.federation.backend.services.Abstraction.IFormationProgramService;

import java.util.List;

@RestController
@RequestMapping("/api/formation/programs")
public class FormationProgramController {

    private final IFormationProgramService programService;

    public FormationProgramController(IFormationProgramService programService) {
        this.programService = programService;
    }

    @GetMapping
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<FormationProgram>> getBySeason(@RequestParam Long seasonId) {
        return ResponseEntity.ok(programService.findBySeason(seasonId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<FormationProgram> getById(@PathVariable Long id) {
        return ResponseEntity.ok(programService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FormationProgram> create(@RequestBody FormationProgram program) {
        return ResponseEntity.ok(programService.create(program));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FormationProgram> update(@PathVariable Long id, @RequestBody FormationProgram program) {
        return ResponseEntity.ok(programService.update(id, program));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        programService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
