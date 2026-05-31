package tn.federation.backend.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.federation.backend.entities.Season;
import tn.federation.backend.services.Abstraction.ISeasonService;

import java.util.List;

@RestController
@RequestMapping("/api/formation/seasons")
public class SeasonController {

    private final ISeasonService seasonService;

    public SeasonController(ISeasonService seasonService) {
        this.seasonService = seasonService;
    }

    @GetMapping
    @PreAuthorize("permitAll()")
    public ResponseEntity<List<Season>> getAll() {
        return ResponseEntity.ok(seasonService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<Season> getById(@PathVariable Long id) {
        return ResponseEntity.ok(seasonService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Season> create(@RequestBody Season season) {
        return ResponseEntity.ok(seasonService.create(season));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Season> update(@PathVariable Long id, @RequestBody Season season) {
        return ResponseEntity.ok(seasonService.update(id, season));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        seasonService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
