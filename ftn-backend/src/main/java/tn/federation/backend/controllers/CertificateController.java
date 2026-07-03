package tn.federation.backend.controllers;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tn.federation.backend.services.ServiceImpl.CertificateService;

/**
 * Single certificate download pipeline (iText-backed). Supersedes the old
 * OpenPDF endpoints on FormationUserController, which have been removed.
 */
@RestController
@RequestMapping("/api/formation/registrations")
public class CertificateController {

    private final CertificateService certificateService;

    public CertificateController(CertificateService certificateService) {
        this.certificateService = certificateService;
    }

    @GetMapping("/{registrationId}/certificate/download")
    @PreAuthorize("hasRole('SWIMMER')")
    public ResponseEntity<byte[]> downloadCertificate(
            @PathVariable Long registrationId,
            @AuthenticationPrincipal UserDetails currentUser) {
        byte[] pdf = certificateService.generateCertificate(registrationId, currentUser.getUsername());
        return pdfResponse(pdf);
    }

    @PostMapping("/{registrationId}/generate-certificate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> adminGenerateCertificate(@PathVariable Long registrationId) {
        return pdfResponse(certificateService.adminGenerateCertificate(registrationId));
    }

    private ResponseEntity<byte[]> pdfResponse(byte[] pdf) {
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"certificat-ftn.pdf\"")
                .body(pdf);
    }
}
