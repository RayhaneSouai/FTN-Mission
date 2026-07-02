package tn.federation.backend.controllers;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import tn.federation.backend.dto.FormationCertificateDTO;
import tn.federation.backend.dto.FormationEligibilityResponse;
import tn.federation.backend.dto.FormationRegistrationDTO;
import tn.federation.backend.services.ServiceImpl.CertificateGeneratorService;
import tn.federation.backend.services.ServiceImpl.EligibilityService;
import tn.federation.backend.services.ServiceImpl.FormationUserService;

import java.util.List;

@RestController
@RequestMapping("/api/formation")
public class FormationUserController {
    private final FormationUserService formationUserService;
    private final EligibilityService eligibilityService;
    private final CertificateGeneratorService certificateGeneratorService;

    public FormationUserController(
            FormationUserService formationUserService,
            EligibilityService eligibilityService,
            CertificateGeneratorService certificateGeneratorService) {
        this.formationUserService = formationUserService;
        this.eligibilityService = eligibilityService;
        this.certificateGeneratorService = certificateGeneratorService;
    }

    @PostMapping("/programs/{programId}/check-eligibility")
    @PreAuthorize("hasAnyRole('SWIMMER', 'COACH')")
    public ResponseEntity<FormationEligibilityResponse> checkEligibility(
            @PathVariable Long programId,
            @AuthenticationPrincipal UserDetails currentUser) {
        return ResponseEntity.ok(eligibilityService.check(programId, currentUser.getUsername()));
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

    @GetMapping("/registrations/{registrationId}/certificate")
    @PreAuthorize("hasRole('SWIMMER')")
    public ResponseEntity<byte[]> downloadCertificate(
            @PathVariable Long registrationId,
            @AuthenticationPrincipal UserDetails currentUser) {
        byte[] pdf = certificateGeneratorService.getOrGenerateCertificate(registrationId, currentUser.getUsername());
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"certificat-ftn.pdf\"")
                .body(pdf);
    }

    @PostMapping("/registrations/{registrationId}/generate-certificate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> adminGenerateCertificate(@PathVariable Long registrationId) {
        byte[] pdf = certificateGeneratorService.adminGenerateCertificate(registrationId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"certificat-ftn.pdf\"")
                .body(pdf);
    }
}
