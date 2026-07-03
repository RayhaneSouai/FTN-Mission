package tn.federation.backend.services.ServiceImpl;

import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Document;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.FontFactory;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.PdfWriter;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import tn.federation.backend.dto.FormationRegistrationDTO;
import tn.federation.backend.entities.FormationCertificate;
import tn.federation.backend.entities.FormationRegistration;
import tn.federation.backend.entities.FormationRegistrationStatus;
import tn.federation.backend.repositories.FormationCertificateRepository;
import tn.federation.backend.repositories.FormationRegistrationRepository;
import tn.federation.backend.services.Abstraction.IEmailService;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class CertificateService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final BaseColor FTN_BLUE = new BaseColor(0, 77, 163);

    private final FormationRegistrationRepository registrationRepository;
    private final FormationCertificateRepository certificateRepository;
    private final IEmailService emailService;

    public CertificateService(
            FormationRegistrationRepository registrationRepository,
            FormationCertificateRepository certificateRepository,
            IEmailService emailService) {
        this.registrationRepository = registrationRepository;
        this.certificateRepository = certificateRepository;
        this.emailService = emailService;
    }

    /**
     * Generates the certificate PDF for the swimmer's own approved + completed registration.
     * Throws 403 if the registration doesn't belong to the requesting swimmer.
     */
    @Transactional
    public byte[] generateCertificate(Long registrationId, String requestingUserEmail) {
        FormationRegistration registration = requireApprovedAndCompleted(registrationId);
        if (!registration.getSwimmer().getEmail().equals(requestingUserEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Ce certificat ne vous appartient pas.");
        }
        return buildCertificatePdf(registration);
    }

    /**
     * Admin variant — same eligibility rules, but bypasses the ownership check.
     */
    @Transactional
    public byte[] adminGenerateCertificate(Long registrationId) {
        return buildCertificatePdf(requireApprovedAndCompleted(registrationId));
    }

    /**
     * Issues certificates for approved registrations whose formation period has ended.
     * Called by the daily scheduler.
     */
    @Transactional
    public int issueCompletedCertificates() {
        List<FormationRegistration> approved = registrationRepository
                .findByStatusOrderByRegisteredAtDesc(FormationRegistrationStatus.APPROVED);
        int issued = 0;
        for (FormationRegistration registration : approved) {
            if (!"COMPLETED".equals(FormationRegistrationDTO.fromEntity(registration).phase())) {
                continue;
            }
            if (hasCertificate(registration)) {
                continue;
            }
            buildCertificatePdf(registration);
            notifyCertificateReady(registration);
            issued++;
        }
        return issued;
    }

    private boolean hasCertificate(FormationRegistration registration) {
        return certificateRepository
                .findBySwimmer_IdOrderByIssuedAtDesc(registration.getSwimmer().getId())
                .stream()
                .anyMatch(cert -> cert.getProgram().getId().equals(registration.getProgram().getId()));
    }

    private void notifyCertificateReady(FormationRegistration registration) {
        try {
            emailService.sendFormationCertificateReady(
                    registration.getSwimmer().getEmail(),
                    registration.getProgram().getTitle()
            );
        } catch (Exception ignored) {
            // Certificate record exists even if email fails
        }
    }

    private FormationRegistration requireApprovedAndCompleted(Long registrationId) {
        FormationRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inscription introuvable"));

        if (registration.getStatus() != FormationRegistrationStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Le certificat ne peut être généré que pour une inscription approuvée.");
        }
        if (!"COMPLETED".equals(FormationRegistrationDTO.fromEntity(registration).phase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Le certificat sera disponible une fois la formation terminée.");
        }
        return registration;
    }

    private byte[] buildCertificatePdf(FormationRegistration registration) {
        FormationCertificate certificate = findOrCreateCertificate(registration);

        String fullName = registration.getSwimmer().getFirstName() + " " + registration.getSwimmer().getLastName();
        String formationTitle = registration.getProgram().getTitle();
        String brevetType = registration.getProgram().getBrevetType() != null
                ? registration.getProgram().getBrevetType().name()
                : "";
        LocalDate issuedAt = certificate.getIssuedAt() != null ? certificate.getIssuedAt() : LocalDate.now();

        return buildPdf(fullName, formationTitle, brevetType, issuedAt, certificate.getVerificationCode());
    }

    private FormationCertificate findOrCreateCertificate(FormationRegistration registration) {
        return certificateRepository
                .findBySwimmer_IdOrderByIssuedAtDesc(registration.getSwimmer().getId())
                .stream()
                .filter(c -> c.getProgram().getId().equals(registration.getProgram().getId()))
                .findFirst()
                .orElseGet(() -> {
                    FormationCertificate cert = new FormationCertificate();
                    cert.setProgram(registration.getProgram());
                    cert.setSwimmer(registration.getSwimmer());
                    cert.setVerificationCode(UUID.randomUUID().toString().toUpperCase().replace("-", "").substring(0, 10));
                    cert.setIssuedAt(LocalDate.now());
                    cert.setDownloadable(true);
                    cert.setVerified(true);
                    return certificateRepository.save(cert);
                });
    }

    private byte[] buildPdf(String fullName, String formationTitle, String brevetType,
                             LocalDate issuedAt, String verificationCode) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4, 60, 60, 80, 80);
            PdfWriter.getInstance(doc, out);
            doc.open();

            // Header
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, FTN_BLUE);
            Paragraph header = new Paragraph("FÉDÉRATION TUNISIENNE DE NATATION", headerFont);
            header.setAlignment(Element.ALIGN_CENTER);
            header.setSpacingAfter(10);
            doc.add(header);

            // Subtitle
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, BaseColor.DARK_GRAY);
            Paragraph subtitle = new Paragraph("CERTIFICAT DE FORMATION", subtitleFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(40);
            doc.add(subtitle);

            // Body
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 13, BaseColor.BLACK);
            Paragraph body = new Paragraph(
                    "Nous certifions que " + fullName + " a suivi et validé avec succès la formation "
                    + formationTitle + " - " + brevetType, bodyFont);
            body.setAlignment(Element.ALIGN_CENTER);
            body.setSpacingAfter(30);
            doc.add(body);

            // Date
            Font dateFont = FontFactory.getFont(FontFactory.HELVETICA, 12, BaseColor.BLACK);
            Paragraph datePara = new Paragraph("Délivré le " + issuedAt.format(DATE_FORMAT), dateFont);
            datePara.setAlignment(Element.ALIGN_CENTER);
            datePara.setSpacingAfter(20);
            doc.add(datePara);

            // Verification code
            Font codeFont = FontFactory.getFont(FontFactory.COURIER, 11, BaseColor.GRAY);
            Paragraph codePara = new Paragraph("Code de vérification : " + verificationCode, codeFont);
            codePara.setAlignment(Element.ALIGN_CENTER);
            codePara.setSpacingAfter(60);
            doc.add(codePara);

            // Footer
            Font footerFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 12, BaseColor.BLACK);
            Paragraph footer = new Paragraph("Signature du Président FTN", footerFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            doc.add(footer);

            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Erreur lors de la génération du certificat : " + e.getMessage());
        }
    }
}
