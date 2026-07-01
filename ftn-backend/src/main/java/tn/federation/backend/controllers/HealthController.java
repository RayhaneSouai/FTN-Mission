package tn.federation.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.federation.backend.entities.InjuryRecord;
import tn.federation.backend.entities.WellnessEntry;
import tn.federation.backend.repositories.InjuryRecordRepository;
import tn.federation.backend.repositories.WellnessEntryRepository;
import tn.federation.backend.services.HealthService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @Autowired
    private WellnessEntryRepository wellnessRepository;

    @Autowired
    private InjuryRecordRepository injuryRepository;

    @Autowired
    private HealthService healthService;

    @PostMapping("/wellness")
    public ResponseEntity<WellnessEntry> addWellness(@RequestBody WellnessEntry entry) {
        if (entry.getEntryDate() == null) {
            entry.setEntryDate(LocalDate.now());
        }
        return ResponseEntity.ok(wellnessRepository.save(entry));
    }

    @GetMapping("/wellness/{userId}")
    public ResponseEntity<List<WellnessEntry>> getWellnessHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(wellnessRepository.findTop7ByUserIdOrderByEntryDateDesc(userId));
    }

    @PostMapping("/injury")
    public ResponseEntity<InjuryRecord> declareInjury(@RequestBody InjuryRecord record) {
        return ResponseEntity.ok(injuryRepository.save(record));
    }

    @GetMapping("/injury/{userId}")
    public ResponseEntity<List<InjuryRecord>> getInjuries(@PathVariable Long userId) {
        return ResponseEntity.ok(injuryRepository.findByUserIdOrderByStartDateDesc(userId));
    }

    @GetMapping("/alerts/{userId}")
    public ResponseEntity<List<String>> getHealthAlerts(@PathVariable Long userId) {
        return ResponseEntity.ok(healthService.generateAlerts(userId));
    }
}
