package tn.federation.backend.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.federation.backend.entities.TrainingSession;
import tn.federation.backend.services.ServiceImpl.TrainingSessionService;

import java.util.List;

@RestController
@RequestMapping("/api/formation/programs/{programId}/sessions")
public class TrainingSessionController {

    private final TrainingSessionService sessionService;

    public TrainingSessionController(TrainingSessionService sessionService) {
        this.sessionService = sessionService;
    }

    @GetMapping
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<TrainingSession>> list(@PathVariable Long programId) {
        return ResponseEntity.ok(sessionService.findByProgram(programId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TrainingSession> create(
            @PathVariable Long programId,
            @RequestBody TrainingSession session) {
        return ResponseEntity.ok(sessionService.create(programId, session));
    }

    @PutMapping("/{sessionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TrainingSession> update(
            @PathVariable Long programId,
            @PathVariable Long sessionId,
            @RequestBody TrainingSession session) {
        return ResponseEntity.ok(sessionService.update(programId, sessionId, session));
    }

    @DeleteMapping("/{sessionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long programId, @PathVariable Long sessionId) {
        sessionService.delete(programId, sessionId);
        return ResponseEntity.noContent().build();
    }
}
