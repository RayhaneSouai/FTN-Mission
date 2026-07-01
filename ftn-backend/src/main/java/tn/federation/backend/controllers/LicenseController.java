package tn.federation.backend.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import tn.federation.backend.entities.User;
import tn.federation.backend.entities.License;
import tn.federation.backend.repositories.UserRepository;
import tn.federation.backend.repositories.LicenseRepository;
import tn.federation.backend.services.Abstraction.ILicenseService;
import tn.federation.backend.services.Abstraction.INotificationService;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/licenses")
@Tag(name = "License Management", description = "Gestion des licences - Administration")
public class LicenseController {
    private final ILicenseService licenseService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LicenseRepository licenseRepository;

    @Autowired
    private INotificationService notificationService;

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

    @GetMapping("/verify/{licenseNumber}")
    @Operation(summary = "Vérifier une licence par son numéro", description = "Vérifie si une licence existe dans la base de données")
    public ResponseEntity<License> verifyLicense(@PathVariable String licenseNumber) {
        return ResponseEntity.ok(licenseService.findByLicenseNumber(licenseNumber));
    }

    @GetMapping("/my-license")
    @PreAuthorize("hasRole('SWIMMER')")
    @Operation(summary = "Récupérer la licence du nageur connecté", description = "Récupère la licence pour une saison spécifique du nageur connecté")
    public ResponseEntity<License> getMyLicense(
            @RequestParam String season,
            @AuthenticationPrincipal UserDetails currentUser) {
        User swimmer = userRepository.findByEmail(currentUser.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Nageur introuvable"));
        
        String normalizedSeason = season.replace('/', '-').trim();
        
        return licenseRepository.findBySeason(normalizedSeason).stream()
                .filter(l -> l.getSwimmer() != null && l.getSwimmer().getId().equals(swimmer.getId()))
                .findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/my-license/validate")
    @PreAuthorize("hasRole('SWIMMER')")
    @Operation(summary = "Valider sa propre licence (Nageur indépendant)", description = "Permet à un nageur sans club de valider/renouveler sa licence sportive")
    public ResponseEntity<License> validateMyLicense(
            @RequestParam String season,
            @RequestParam(required = false, defaultValue = "true") Boolean isValidated,
            @AuthenticationPrincipal UserDetails currentUser) {
        User swimmer = userRepository.findByEmail(currentUser.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Nageur introuvable"));
        
        if (swimmer.getClub() != null) {
            throw new IllegalArgumentException("Vous êtes affilié(e) à un club. Votre coach doit valider la saison de votre club.");
        }
        
        String normalizedSeason = season.replace('/', '-').trim();
        
        License license = licenseRepository.findBySeason(normalizedSeason).stream()
                .filter(l -> l.getSwimmer() != null && l.getSwimmer().getId().equals(swimmer.getId()))
                .findFirst()
                .orElseGet(() -> {
                    License l = new License();
                    l.setSwimmer(swimmer);
                    l.setSeason(normalizedSeason);
                    l.setIssueDate(LocalDate.now());
                    l.setExpiryDate(LocalDate.now().plusMonths(12));
                    String regionPart = "IND";
                    l.setLicenseNumber("LIC-" + regionPart + "-IND-" + normalizedSeason + "-" + UUID.randomUUID().toString().substring(0, 8));
                    return l;
                });
        
        license.setValidationStatus(isValidated ? "VALIDATED" : "REFUSED");
        License saved = licenseRepository.save(license);
        
        notificationService.notifyAdminOfIndependentSwimmerValidationDecision(swimmer, normalizedSeason, isValidated);
        
        return ResponseEntity.ok(saved);
    }
}
