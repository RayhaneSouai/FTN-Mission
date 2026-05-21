package tn.federation.backend.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tn.federation.backend.dto.AuthResponseDTO;
import tn.federation.backend.dto.LoginRequestDTO;
import tn.federation.backend.dto.PasswordResetDTO;
import tn.federation.backend.dto.PasswordResetRequestDTO;
import tn.federation.backend.dto.RegisterRequestDTO;
import tn.federation.backend.services.Abstraction.IAuthService;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Gestion de l'authentification et du mot de passe")
public class AuthController {
    private final IAuthService authService;

    public AuthController(IAuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @Operation(summary = "Inscription d'un nouvel utilisateur", description = "Permet à un nouvel utilisateur de s'inscrire avec email, mot de passe et rôle")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Inscription réussie, token JWT retourné"),
            @ApiResponse(responseCode = "400", description = "Données invalides ou email déjà utilisé")
    })
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    @Operation(summary = "Connexion utilisateur", description = "Authentifier un utilisateur avec email et mot de passe")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Connexion réussie, token JWT retourné"),
            @ApiResponse(responseCode = "400", description = "Email ou mot de passe incorrect")
    })
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/password-reset-request")
    @Operation(summary = "Demande de réinitialisation de mot de passe", description = "Envoie un email avec un token de réinitialisation")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Email de réinitialisation envoyé"),
            @ApiResponse(responseCode = "400", description = "Email invalide ou utilisateur non trouvé")
    })
    public ResponseEntity<Void> passwordResetRequest(@Valid @RequestBody PasswordResetRequestDTO request) {
        authService.requestPasswordReset(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/password-reset")
    @Operation(summary = "Réinitialiser le mot de passe", description = "Définir un nouveau mot de passe avec un token valide")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Mot de passe réinitialisé avec succès"),
            @ApiResponse(responseCode = "400", description = "Token invalide ou expiré")
    })
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody PasswordResetDTO request) {
        authService.resetPassword(request);
        return ResponseEntity.ok().build();
    }
}
