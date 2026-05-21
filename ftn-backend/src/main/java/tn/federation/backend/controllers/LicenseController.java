package tn.federation.backend.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.federation.backend.entities.License;
import tn.federation.backend.services.Abstraction.ILicenseService;

import java.util.List;

@RestController
@RequestMapping("/api/licenses")
@Tag(name = "License Management", description = "Gestion des licences - Administration")
public class LicenseController {
    private final ILicenseService licenseService;

    public LicenseController(ILicenseService licenseService) {
        this.licenseService = licenseService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Récupérer toutes les licences", description = "Liste toutes les licences du système")
    public ResponseEntity<List<License>> getAllLicenses() {
        return ResponseEntity.ok(licenseService.findAllLicenses());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Récupérer une licence par ID", description = "Affiche les détails d'une licence spécifique")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Licence trouvée"),
            @ApiResponse(responseCode = "400", description = "Licence non trouvée")
    })
    public ResponseEntity<License> getLicense(@PathVariable Long id) {
        return ResponseEntity.ok(licenseService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Créer une nouvelle licence", description = "Ajoute une nouvelle licence au système")
    public ResponseEntity<License> createLicense(@Valid @RequestBody License license) {
        return ResponseEntity.ok(licenseService.createLicense(license));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Mettre à jour une licence", description = "Modifie les informations d'une licence existante")
    public ResponseEntity<License> updateLicense(@PathVariable Long id, @Valid @RequestBody License license) {
        return ResponseEntity.ok(licenseService.updateLicense(id, license));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Supprimer une licence", description = "Supprime une licence du système")
    public ResponseEntity<Void> deleteLicense(@PathVariable Long id) {
        licenseService.deleteLicense(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/generate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Générer les licences pour une saison", description = "Génère automatiquement les licences numériques pour tous les clubs d'une saison donnée")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Licences générées avec succès")
    })
    public ResponseEntity<List<License>> generateLicenses(@RequestParam String season) {
        return ResponseEntity.ok(licenseService.generateLicensesForSeason(season));
    }
}
