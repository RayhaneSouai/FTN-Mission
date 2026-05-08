package tn.federation.backend.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.federation.backend.dtos.PerformanceRequestDTO;
import tn.federation.backend.dtos.PerformanceResponseDTO;
import tn.federation.backend.services.Abstraction.IPerformanceService;
import java.util.List;
@RestController
@RequestMapping("/api/performances")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class PerformanceController {
    private final IPerformanceService performanceService;



    @PostMapping
    public ResponseEntity<PerformanceResponseDTO> create(@Valid @RequestBody PerformanceRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(performanceService.create(dto)); }
    @PutMapping("/{id}")
    public ResponseEntity<PerformanceResponseDTO> update( @PathVariable Long id, @Valid @RequestBody PerformanceRequestDTO dto) {
        return ResponseEntity.ok(performanceService.update(id, dto)); }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        performanceService.delete(id); return ResponseEntity.noContent().build(); }
    @GetMapping("/{id}")
    public ResponseEntity<PerformanceResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(performanceService.findById(id)); }
    @GetMapping
    public ResponseEntity<List<PerformanceResponseDTO>> findAll() {
        return ResponseEntity.ok(performanceService.findAll()); }
    @GetMapping("/swimmer/{swimmerId}")
    public ResponseEntity<List<PerformanceResponseDTO>> findBySwimmer( @PathVariable Long swimmerId) {
        return ResponseEntity.ok(performanceService.findBySwimmer(swimmerId)); } }

