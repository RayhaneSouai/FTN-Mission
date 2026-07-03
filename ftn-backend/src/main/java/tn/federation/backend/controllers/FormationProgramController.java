package tn.federation.backend.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import tn.federation.backend.entities.FormationProgram;
import tn.federation.backend.entities.User;
import tn.federation.backend.repositories.UserRepository;
import tn.federation.backend.services.Abstraction.IFormationProgramService;

import java.util.List;

@RestController
@RequestMapping("/api/formation/programs")
public class FormationProgramController {

    private final IFormationProgramService programService;
    private final UserRepository userRepository;

    public FormationProgramController(IFormationProgramService programService, UserRepository userRepository) {
        this.programService = programService;
        this.userRepository = userRepository;
    }

    @GetMapping
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<FormationProgram>> getBySeason(@RequestParam Long seasonId) {
        return ResponseEntity.ok(programService.findBySeason(seasonId));
    }

    @GetMapping("/coach-programs")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<FormationProgram>> getCoachPrograms(@RequestParam(required = false) Long seasonId) {
        return ResponseEntity.ok(programService.getCoachCertificationPrograms(seasonId));
    }

    @GetMapping("/swimmer-programs")
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<FormationProgram>> getSwimmerPrograms(@RequestParam(required = false) Long seasonId) {
        return ResponseEntity.ok(programService.getSwimmerTrainingPrograms(seasonId));
    }

    /**
     * Rule-based complement to the AI eligibility check: programs whose
     * registrationConditions text mentions the current user's niveau.
     */
    @GetMapping("/eligible")
    @PreAuthorize("hasAnyRole('SWIMMER', 'COACH')")
    public ResponseEntity<List<FormationProgram>> getEligiblePrograms(@AuthenticationPrincipal UserDetails currentUser) {
        User user = userRepository.findByEmail(currentUser.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));
        String niveau = user.getNiveau() != null ? user.getNiveau().name() : "";
        return ResponseEntity.ok(programService.getEligiblePrograms(niveau));
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
