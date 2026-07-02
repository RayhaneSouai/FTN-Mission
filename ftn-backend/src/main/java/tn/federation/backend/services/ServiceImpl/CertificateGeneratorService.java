package tn.federation.backend.services.ServiceImpl;

import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import tn.federation.backend.entities.FormationCertificate;
import tn.federation.backend.entities.FormationRegistration;
import tn.federation.backend.repositories.FormationCertificateRepository;
import tn.federation.backend.repositories.FormationRegistrationRepository;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class CertificateGeneratorService {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final Color FTN_BLUE = new Color(0, 77, 163);
    private static final Color GOLD = new Color(184, 134, 11);

    private final FormationRegistrationRepository registrationRepository;
    private final FormationCertificateRepository certificateRepository;

    public CertificateGeneratorService(
            FormationRegistrationRepository registrationRepository,
            FormationCertificateRepository certificateRepository) {
        this.registrationRepository = registrationRepository;
        this.certificateRepository = certificateRepository;
    }

    /**
     * Generate (or retrieve) a PDF certificate for the given registration.
     * Returns raw PDF bytes ready to send as application/pdf.
     */
    @Transactional
    public byte[] getOrGenerateCertificate(Long registrationId, String requestingUserEmail) {
        FormationRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inscription introuvable"));

        if (!registration.getSwimmer().getEmail().equals(requestingUserEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé");
        }

        return certificateRepository
                .findByVerificationCode(buildCode(registration))
                .map(existing -> generatePdf(registration, existing.getVerificationCode()))
                .orElseGet(() -> {
                    String code = UUID.randomUUID().toString().toUpperCase().replace("-", "").substring(0, 10);
                    FormationCertificate cert = new FormationCertificate();
                    cert.setProgram(registration.getProgram());
                    cert.setSwimmer(registration.getSwimmer());
                    cert.setVerificationCode(code);
                    cert.setIssuedAt(LocalDate.now());
                    cert.setDownloadable(true);
                    cert.setVerified(true);
                    certificateRepository.save(cert);
                    return generatePdf(registration, code);
                });
    }

    /**
     * Admin endpoint — force generate a certificate for any registration.
     */
    @Transactional
    public byte[] adminGenerateCertificate(Long registrationId) {
        FormationRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inscription introuvable"));

        String code = UUID.randomUUID().toString().toUpperCase().replace("-", "").substring(0, 10);

        FormationCertificate cert = certificateRepository
                .findBySwimmer_IdOrderByIssuedAtDesc(registration.getSwimmer().getId())
                .stream()
                .filter(c -> c.getProgram().getId().equals(registration.getProgram().getId()))
                .findFirst()
                .orElse(new FormationCertificate());

        cert.setProgram(registration.getProgram());
        cert.setSwimmer(registration.getSwimmer());
        if (cert.getVerificationCode() == null) {
            cert.setVerificationCode(code);
        }
        cert.setIssuedAt(LocalDate.now());
        cert.setDownloadable(true);
        cert.setVerified(true);
        certificateRepository.save(cert);

        return generatePdf(registration, cert.getVerificationCode());
    }

    private byte[] generatePdf(FormationRegistration registration, String verificationCode) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4, 60, 60, 80, 80);
            PdfWriter.getInstance(doc, out);
            doc.open();

            // Border
            doc.add(buildBorderParagraph());

            // Header
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, FTN_BLUE);
            Paragraph header = new Paragraph("Fédération Tunisienne de Natation", headerFont);
            header.setAlignment(Element.ALIGN_CENTER);
            header.setSpacingAfter(4);
            doc.add(header);

            Font subHeaderFont = FontFactory.getFont(FontFactory.HELVETICA, 13, FTN_BLUE);
            Paragraph subHeader = new Paragraph("Certificat de Formation", subHeaderFont);
            subHeader.setAlignment(Element.ALIGN_CENTER);
            subHeader.setSpacingAfter(30);
            doc.add(subHeader);

            // Gold separator line (simulated via a paragraph with underline)
            Font separatorFont = FontFactory.getFont(FontFactory.HELVETICA, 1, GOLD);
            Paragraph sep = new Paragraph("─────────────────────────────────────────────────────────────────", separatorFont);
            sep.setAlignment(Element.ALIGN_CENTER);
            sep.setSpacingAfter(30);
            doc.add(sep);

            // Certify line
            Font bodyFont = FontFactory.getFont(FontFactory.HELVETICA, 13, Color.DARK_GRAY);
            Paragraph certify = new Paragraph("La Fédération Tunisienne de Natation certifie que :", bodyFont);
            certify.setAlignment(Element.ALIGN_CENTER);
            certify.setSpacingAfter(18);
            doc.add(certify);

            // Swimmer name
            String swimmerName = registration.getSwimmer().getFirstName() + " " + registration.getSwimmer().getLastName();
            Font nameFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 26, FTN_BLUE);
            Paragraph namePara = new Paragraph(swimmerName, nameFont);
            namePara.setAlignment(Element.ALIGN_CENTER);
            namePara.setSpacingAfter(28);
            doc.add(namePara);

            // Formation info
            Font infoFont = FontFactory.getFont(FontFactory.HELVETICA, 13, Color.DARK_GRAY);
            String brevetLabel = registration.getProgram().getBrevetType() != null
                    ? registration.getProgram().getBrevetType().name()
                    : "";
            Paragraph info = new Paragraph(
                    "a complété avec succès la formation « " + registration.getProgram().getTitle()
                    + " » — Brevet " + brevetLabel + ".", infoFont);
            info.setAlignment(Element.ALIGN_CENTER);
            info.setSpacingAfter(12);
            doc.add(info);

            // Date
            Paragraph datePara = new Paragraph("Délivré le : " + LocalDate.now().format(DATE_FORMAT), infoFont);
            datePara.setAlignment(Element.ALIGN_CENTER);
            datePara.setSpacingAfter(36);
            doc.add(datePara);

            // Separator
            doc.add(sep);

            // Verification code
            Font codeFont = FontFactory.getFont(FontFactory.COURIER, 11, Color.GRAY);
            Paragraph codePara = new Paragraph("Code de vérification : " + verificationCode, codeFont);
            codePara.setAlignment(Element.ALIGN_CENTER);
            codePara.setSpacingBefore(24);
            doc.add(codePara);

            Font verifyFont = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.GRAY);
            Paragraph verifyPara = new Paragraph("Vérifiable sur le portail officiel de la FTN", verifyFont);
            verifyPara.setAlignment(Element.ALIGN_CENTER);
            doc.add(verifyPara);

            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Erreur lors de la génération du certificat : " + e.getMessage());
        }
    }

    private Paragraph buildBorderParagraph() {
        Font borderFont = FontFactory.getFont(FontFactory.HELVETICA, 1);
        Paragraph border = new Paragraph(" ", borderFont);
        border.setSpacingAfter(10);
        return border;
    }

    // Deterministic code lookup key (used only when looking for an existing cert)
    private String buildCode(FormationRegistration registration) {
        return certificateRepository
                .findBySwimmer_IdOrderByIssuedAtDesc(registration.getSwimmer().getId())
                .stream()
                .filter(c -> c.getProgram().getId().equals(registration.getProgram().getId()))
                .findFirst()
                .map(FormationCertificate::getVerificationCode)
                .orElse("__NOT_FOUND__");
    }
}
