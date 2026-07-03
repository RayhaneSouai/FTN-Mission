package tn.federation.backend.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import tn.federation.backend.dto.FormationCertificateDTO;
import tn.federation.backend.dto.FormationRegistrationDTO;
import tn.federation.backend.services.ServiceImpl.FormationUserService;

import java.util.List;

/**
 * Certificate download/generation lives on {@link CertificateController}
 * (the single iText-backed pipeline). Eligibility checks live on
 * {@link EligibilityController} (the single Gemini-backed pipeline) — not here.
 */
@RestController
@RequestMapping("/api/formation")
public class FormationUserController {
    private final FormationUserService formationUserService;

    public FormationUserController(FormationUserService formationUserService) {
        this.formationUserService = formationUserService;
    }

    @PostMapping("/programs/{programId}/registrations")
    @PreAuthorize("hasRole('SWIMMER')")
    public ResponseEntity<FormationRegistrationDTO> register(
            @PathVariable Long programId,
            @AuthenticationPrincipal UserDetails currentUser) {
        return ResponseEntity.ok(formationUserService.register(programId, currentUser.getUsername()));
    }

    @GetMapping("/my-registrations")
    @PreAuthorize("hasRole('SWIMMER')")
    public ResponseEntity<List<FormationRegistrationDTO>> myRegistrations(
            @AuthenticationPrincipal UserDetails currentUser) {
        return ResponseEntity.ok(formationUserService.findMyRegistrations(currentUser.getUsername()));
    }

    @GetMapping("/my-history")
    @PreAuthorize("hasRole('SWIMMER')")
    public ResponseEntity<List<FormationRegistrationDTO>> myHistory(
            @AuthenticationPrincipal UserDetails currentUser) {
        return ResponseEntity.ok(formationUserService.findMyHistory(currentUser.getUsername()));
    }

    @GetMapping("/my-certificates")
    @PreAuthorize("hasRole('SWIMMER')")
    public ResponseEntity<List<FormationCertificateDTO>> myCertificates(
            @AuthenticationPrincipal UserDetails currentUser) {
        return ResponseEntity.ok(formationUserService.findMyCertificates(currentUser.getUsername()));
    }

    @GetMapping("/certificates/verify/{code}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<FormationCertificateDTO> verifyCertificate(@PathVariable String code) {
        return ResponseEntity.ok(formationUserService.verifyCertificate(code));
    }

}
