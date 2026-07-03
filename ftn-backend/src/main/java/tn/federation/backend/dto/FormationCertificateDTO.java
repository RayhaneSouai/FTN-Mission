package tn.federation.backend.dto;

import tn.federation.backend.entities.FormationCertificate;
import tn.federation.backend.entities.FormationProgram;

import java.time.LocalDate;

public record FormationCertificateDTO(
        Long id,
        String verificationCode,
        LocalDate issuedAt,
        String pdfUrl,
        boolean downloadable,
        boolean verified,
        FormationProgram program,
        Long registrationId
) {
    public static FormationCertificateDTO fromEntity(FormationCertificate certificate) {
        return fromEntity(certificate, null);
    }

    public static FormationCertificateDTO fromEntity(FormationCertificate certificate, Long registrationId) {
        return new FormationCertificateDTO(
                certificate.getId(),
                certificate.getVerificationCode(),
                certificate.getIssuedAt(),
                certificate.getPdfUrl(),
                certificate.isDownloadable(),
                certificate.isVerified(),
                certificate.getProgram(),
                registrationId);
    }
}
