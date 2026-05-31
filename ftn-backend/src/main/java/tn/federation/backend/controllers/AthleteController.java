package tn.federation.backend.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import tn.federation.backend.config.OpenApiConfig;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tn.federation.backend.dto.AthleteProgressDTO;
import tn.federation.backend.dto.UserDTO;
import tn.federation.backend.services.Abstraction.IUserService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/api/athlete")
@Tag(name = "Athlete Space", description = "Espace personnel nageur - Accès aux profils et progression")
public class AthleteController {
    private final IUserService userService;

    public AthleteController(IUserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @Operation(summary = "Consulter mon profil", description = "Affiche le profil personnalisé du nageur connecté")
    public ResponseEntity<UserDTO> getProfile() {
        String email = getCurrentEmail();
        return ResponseEntity.ok(userService.findByEmail(email));
    }

    @GetMapping("/progress")
    @SecurityRequirement(name = OpenApiConfig.BEARER_AUTH)
    @Operation(summary = "Consulter ma courbe de progression", description = "Affiche la progression par distance et nage du nageur connecté")
    public ResponseEntity<AthleteProgressDTO> getProgress() {
        String email = getCurrentEmail();
        UserDTO user = userService.findByEmail(email);
        return ResponseEntity.ok(userService.getAthleteProgress(user.getId()));
    }

    private String getCurrentEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();

    }
}
