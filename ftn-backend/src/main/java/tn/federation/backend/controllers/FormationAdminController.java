package tn.federation.backend.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import tn.federation.backend.dto.FormationRegistrationDTO;
import tn.federation.backend.entities.FormationRegistrationStatus;
import tn.federation.backend.services.ServiceImpl.FormationUserService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/formation/admin/registrations")
@PreAuthorize("hasRole('ADMIN')")
public class FormationAdminController {

    private final FormationUserService formationUserService;

    public FormationAdminController(FormationUserService formationUserService) {
        this.formationUserService = formationUserService;
    }

    @GetMapping
    public ResponseEntity<List<FormationRegistrationDTO>> list(
            @RequestParam(required = false) Long seasonId,
            @RequestParam(required = false) FormationRegistrationStatus status) {
        return ResponseEntity.ok(formationUserService.listForAdmin(seasonId, status));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<FormationRegistrationDTO> approve(@PathVariable Long id) {
        return ResponseEntity.ok(formationUserService.approveRegistration(id));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<FormationRegistrationDTO> reject(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        String reason = body != null ? body.get("reason") : null;
        return ResponseEntity.ok(formationUserService.rejectRegistration(id, reason));
    }

    @PutMapping("/{id}/waitlist")
    public ResponseEntity<FormationRegistrationDTO> waitlist(@PathVariable Long id) {
        return ResponseEntity.ok(formationUserService.waitlistRegistration(id));
    }
}
