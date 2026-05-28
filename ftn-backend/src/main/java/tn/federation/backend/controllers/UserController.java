package tn.federation.backend.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.federation.backend.dto.AdminUserCreateRequestDTO;
import tn.federation.backend.dto.AdminUserCreateResponseDTO;
import tn.federation.backend.dto.BulkUserImportRequestDTO;
import tn.federation.backend.dto.BulkUserImportResponseDTO;
import tn.federation.backend.dto.UserDTO;
import tn.federation.backend.dto.ChangePasswordRequestDTO;
import tn.federation.backend.dto.PasswordResetRequestDTO;
import tn.federation.backend.services.Abstraction.IAuthService;
import tn.federation.backend.services.Abstraction.IUserService;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User Management", description = "Gestion des utilisateurs - Administration")
public class UserController {
    private final IUserService userService;
    private final IAuthService authService;

    public UserController(IUserService userService, IAuthService authService) {
        this.userService = userService;
        this.authService = authService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Récupérer tous les utilisateurs", description = "Liste tous les utilisateurs (y compris en attente de validation) — Admin uniquement")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.findAllUsers());
    }

    @GetMapping("/swimmers")
    @Operation(summary = "Récupérer tous les nageurs", description = "Liste tous les nageurs enregistrés (utilisateurs authentifiés)")
    public ResponseEntity<List<UserDTO>> getSwimmers() {
        return ResponseEntity.ok(userService.findSwimmers());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Récupérer un utilisateur par ID", description = "Affiche les détails d'un utilisateur spécifique (utilisateurs authentifiés)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Utilisateur trouvé"),
            @ApiResponse(responseCode = "400", description = "Utilisateur non trouvé")
    })
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    @GetMapping("/{id}/dashboard-stats")
    @Operation(summary = "Récupérer les statistiques du nageur", description = "Affiche les statistiques globales du nageur (participations, performances, favoris)")
    public ResponseEntity<tn.federation.backend.dto.SwimmerDashboardDTO> getSwimmerDashboardStats(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getSwimmerDashboardStats(id));
    }

    @GetMapping("/admin/dashboard-stats")
    @Operation(summary = "Statistiques de l'admin", description = "Statistiques globales de la plateforme (admin)")
    public ResponseEntity<tn.federation.backend.dto.AdminDashboardDTO> getAdminDashboardStats() {
        return ResponseEntity.ok(userService.getAdminDashboardStats());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Créer un nouvel utilisateur", description = "Ajoute un nouvel utilisateur au système (Admin uniquement)")
    public ResponseEntity<AdminUserCreateResponseDTO> createUser(@Valid @RequestBody AdminUserCreateRequestDTO request) {
        return ResponseEntity.ok(userService.createUser(request));
    }

    @PostMapping("/import")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Importer des utilisateurs en masse", description = "Crée plusieurs utilisateurs à partir d'un import CSV validé (Admin uniquement)")
    public ResponseEntity<BulkUserImportResponseDTO> importUsers(@Valid @RequestBody BulkUserImportRequestDTO request) {
        return ResponseEntity.ok(userService.importUsers(request.getUsers()));
    }



    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or isAuthenticated()")
    @Operation(summary = "Mettre à jour un utilisateur", description = "Modifie les informations d'un utilisateur existant (Admin uniquement)")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @Valid @RequestBody UserDTO dto) {
        return ResponseEntity.ok(userService.updateUser(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Supprimer un utilisateur", description = "Supprime un utilisateur du système (Admin uniquement)")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Approuver une inscription", description = "Approuve et active un utilisateur en attente (Admin uniquement)")
    public ResponseEntity<UserDTO> approveUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.approveUser(id));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Refuser une inscription", description = "Refuse l'inscription d'un utilisateur (Admin uniquement)")
    public ResponseEntity<UserDTO> rejectUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.rejectUser(id));
    }

    @PostMapping("/request-password-change")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Demander le changement de mot de passe", description = "Envoie un email avec un lien de réinitialisation du mot de passe")
    public ResponseEntity<Void> requestPasswordChange() {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = auth.getName();
        tn.federation.backend.dto.PasswordResetRequestDTO dto = new tn.federation.backend.dto.PasswordResetRequestDTO();
        dto.setEmail(currentEmail);
        authService.requestPasswordReset(dto);
        return ResponseEntity.ok().build();
    }
}
