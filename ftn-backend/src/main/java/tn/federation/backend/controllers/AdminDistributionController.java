package tn.federation.backend.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.federation.backend.dto.DistributionResponseDTO;
import tn.federation.backend.services.Abstraction.IDistributionService;

@RestController
@RequestMapping("/api/admin/competitions")
@RequiredArgsConstructor
public class AdminDistributionController {

    private final IDistributionService distributionService;

    @PostMapping("/{competitionId}/distribution/generate")
    public ResponseEntity<DistributionResponseDTO> generateDistribution(@PathVariable Long competitionId) {
        DistributionResponseDTO result = distributionService.generateDistribution(competitionId);
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{competitionId}/distribution/approve")
    public ResponseEntity<DistributionResponseDTO> approveDistribution(@PathVariable Long competitionId) {
        DistributionResponseDTO result = distributionService.approveDistribution(competitionId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{competitionId}/distribution")
    public ResponseEntity<DistributionResponseDTO> getDistribution(@PathVariable Long competitionId) {
        DistributionResponseDTO result = distributionService.getDistribution(competitionId);
        if (result == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(result);
    }
}
