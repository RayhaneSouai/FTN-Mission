package tn.federation.backend.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.federation.backend.dtos.RecordDTO;
import tn.federation.backend.entities.Gender;
import tn.federation.backend.entities.StrokeType;
import tn.federation.backend.services.Abstraction.IRecordService;
import java.util.List;
@RestController
@RequestMapping("/api/records")
@RequiredArgsConstructor
@CrossOrigin("*")
@Tag(name = "Records", description = "Records personnels et nationaux")
public class RecordController {
    private final IRecordService recordService;
    @Operation(summary = "Records personnels d'un nageur", description = "Liste tous les meilleurs chronos (PR) du nageur sur chaque épreuve")
    @GetMapping("/personal/{swimmerId}")
    public ResponseEntity<List<RecordDTO>> getPersonalRecords(@PathVariable Long swimmerId) {
        return ResponseEntity.ok(recordService.getPersonalRecords(swimmerId)); }
    @Operation(summary = "Tous les records nationaux", description = "Retourne tous les records nationaux actifs (1 par combinaison épreuve/genre)")
    @GetMapping("/national")
    public ResponseEntity<List<RecordDTO>> getAllNationalRecords() {
        return ResponseEntity.ok(recordService.getAllNationalRecords()); }
    @Operation(summary = "Record national pour une épreuve précise")
    @GetMapping("/national/event")
    public ResponseEntity<RecordDTO> getNationalRecordForEvent(@RequestParam Integer distance, @RequestParam StrokeType stroke, @RequestParam Gender gender) {
        return ResponseEntity.ok(recordService.getNationalRecordForEvent(distance, stroke, gender)); } }

