package tn.federation.backend.services.ServiceImpl;

import tn.federation.backend.config.AppSecurityProperties;
import tn.federation.backend.entities.User;
import tn.federation.backend.services.Abstraction.IEmailService;
import tn.federation.backend.util.EmailHtmlTemplates;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailServiceImpl implements IEmailService {
    private static final Logger LOGGER = LoggerFactory.getLogger(EmailServiceImpl.class);
    private final JavaMailSender mailSender;
    private final AppSecurityProperties appProperties;

    public EmailServiceImpl(JavaMailSender mailSender, AppSecurityProperties appProperties) {
        this.mailSender = mailSender;
        this.appProperties = appProperties;
    }

    @Override
    @org.springframework.scheduling.annotation.Async
    public void sendPasswordReset(String to, String token) {
        String link = buildResetLink(token, false);
        String body = "<p style=\"margin:0 0 12px;\">Bonjour,</p>"
                + "<p style=\"margin:0 0 12px;\">Nous avons reçu une demande de réinitialisation de votre mot de passe FTN. "
                + "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>"
                + EmailHtmlTemplates.primaryButton("Réinitialiser mon mot de passe", link)
                + "<p style=\"margin:16px 0 0;font-size:13px;color:#64748b;\">Ce lien est valable "
                + appProperties.getSecurity().getPasswordResetHours() + " heures.</p>";
        sendHtml(to, "Réinitialisation de mot de passe — FTN", EmailHtmlTemplates.layout("Réinitialisation", body));
    }

    @Override
    @org.springframework.scheduling.annotation.Async
    public void sendAdminCreatedUserWelcome(String to, String firstName, String temporaryPassword, String setupToken) {
        String setupLink = buildResetLink(setupToken, true);
        String body = "<p style=\"margin:0 0 12px;\">Bonjour <strong>" + escape(firstName) + "</strong>,</p>"
                + "<p style=\"margin:0 0 12px;\">Un administrateur FTN a créé votre compte. Voici vos informations de connexion :</p>"
                + EmailHtmlTemplates.infoBox("Adresse email", to)
                + EmailHtmlTemplates.infoBox("Mot de passe temporaire", temporaryPassword)
                + EmailHtmlTemplates.warningBox(
                "Pour des raisons de sécurité, vous devez définir un nouveau mot de passe avant votre première connexion. "
                        + "Utilisez le bouton ci-dessous — le mot de passe temporaire ne sera plus utilisable après cette étape.")
                + EmailHtmlTemplates.primaryButton("Configurer mon mot de passe", setupLink)
                + "<p style=\"margin:16px 0 0;font-size:13px;color:#64748b;\">Lien valable "
                + appProperties.getSecurity().getAccountSetupHours() + " heures. Ne partagez pas ce message.</p>";
        sendHtml(to, "Votre compte FTN a été créé", EmailHtmlTemplates.layout("Bienvenue sur FTN", body));
    }

    @Override
    @org.springframework.scheduling.annotation.Async
    public void sendRegistrationPendingAdmin(User user) {
        String adminEmail = "admin@ftn.tn";
        String body = "<p>Un nouvel utilisateur s'est inscrit et attend votre approbation.</p>"
                + EmailHtmlTemplates.infoBox("Nom", user.getFirstName() + " " + user.getLastName())
                + EmailHtmlTemplates.infoBox("Email", user.getEmail())
                + EmailHtmlTemplates.infoBox("Rôle", String.valueOf(user.getRole()));
        sendHtml(adminEmail, "Nouvelle inscription en attente — FTN",
                EmailHtmlTemplates.layout("Inscription en attente", body));
    }

    @Override
    @org.springframework.scheduling.annotation.Async
    public void sendRegistrationDecision(String to, boolean approved) {
        String status = approved ? "approuvée" : "refusée";
        String body = "<p>Votre demande d'inscription a été <strong>" + status + "</strong>.</p>";
        if (approved) {
            String forgotPasswordLink = appProperties.getFrontend().getBaseUrl().replaceAll("/$", "") + "/auth/forgot-password";
            body += "<p>Si votre compte a été créé via un import de fichier CSV, vous devez d'abord définir votre mot de passe.</p>"
                    + "<p>Veuillez vous rendre sur la page de connexion, puis cliquer sur <strong>\"Mot de passe oublié\"</strong> "
                    + "pour configurer votre mot de passe, ou utilisez directement le lien suivant :</p>"
                    + EmailHtmlTemplates.primaryButton("Définir mon mot de passe", forgotPasswordLink);
        }
        sendHtml(to, "Décision d'inscription — FTN", EmailHtmlTemplates.layout("Inscription " + status, body));
    }

    @Override
    @org.springframework.scheduling.annotation.Async
    public void sendPasswordResetLink(String to, String token) {
        sendPasswordReset(to, token);
    }

    @Override
    @org.springframework.scheduling.annotation.Async
    public void sendPasswordChangedNotification(String to) {
        String body = "<p style=\"margin:0 0 12px;\">Bonjour,</p>"
                + "<p style=\"margin:0 0 12px;\">Le mot de passe de votre compte FTN a été modifié avec succès.</p>"
                + EmailHtmlTemplates.warningBox(
                "Si vous n'êtes pas à l'origine de cette modification, contactez immédiatement l'administration.");
        sendHtml(to, "Mot de passe modifié — FTN", EmailHtmlTemplates.layout("Mot de passe modifié", body));
    }

    @Override
    public void sendFormationRegistrationPendingAdmin(String swimmerName, String swimmerEmail, String programTitle, String brevetType) {
        String adminEmail = "admin@ftn.tn";
        String frontendBase = appProperties.getFrontend().getBaseUrl().replaceAll("/$", "");
        String body = "<p>Un nageur a demandé à s'inscrire à une formation coach.</p>"
                + EmailHtmlTemplates.infoBox("Nageur", escape(swimmerName))
                + EmailHtmlTemplates.infoBox("Email", escape(swimmerEmail))
                + EmailHtmlTemplates.infoBox("Formation", escape(programTitle))
                + EmailHtmlTemplates.infoBox("Brevet", escape(brevetType))
                + EmailHtmlTemplates.primaryButton("Gérer les inscriptions", frontendBase + "/admin/formations");
        sendHtml(adminEmail, "Nouvelle inscription formation — FTN",
                EmailHtmlTemplates.layout("Inscription formation en attente", body));
    }

    @Override
    public void sendFormationCertificateReady(String to, String programTitle) {
        String frontendBase = appProperties.getFrontend().getBaseUrl().replaceAll("/$", "");
        String body = "<p style=\"margin:0 0 12px;\">Bonjour,</p>"
                + "<p style=\"margin:0 0 12px;\">Votre formation <strong>" + escape(programTitle)
                + "</strong> est terminée. Votre certificat de participation est disponible.</p>"
                + EmailHtmlTemplates.primaryButton("Voir mes formations", frontendBase + "/formations/mes-formations");
        sendHtml(to, "Certificat de formation disponible — FTN",
                EmailHtmlTemplates.layout("Certificat disponible", body));
    }

    @Override
    @org.springframework.scheduling.annotation.Async
    public void sendClubAdminErrorReportToAdmin(
            String adminEmail,
            String coachName,
            String coachEmail,
            String clubName,
            String season,
            String fieldLabels,
            String description) {
        String profileLink = appProperties.getFrontend().getBaseUrl().replaceAll("/$", "") + "/admin/clubs";
        String body = "<p style=\"margin:0 0 12px;\">Bonjour,</p>"
                + "<p style=\"margin:0 0 12px;\">Un coach a signalé des erreurs sur une fiche administrative de club.</p>"
                + EmailHtmlTemplates.infoBox("Coach", coachName)
                + EmailHtmlTemplates.infoBox("Email du coach", coachEmail)
                + EmailHtmlTemplates.infoBox("Club", clubName)
                + EmailHtmlTemplates.infoBox("Saison", season)
                + EmailHtmlTemplates.infoBox("Champs signalés", fieldLabels);
        if (description != null && !description.isBlank()) {
            body += EmailHtmlTemplates.infoBox("Description", description);
        }
        body += EmailHtmlTemplates.primaryButton("Consulter les clubs", profileLink)
                + EmailHtmlTemplates.warningBox("Ce signalement est également visible dans vos notifications FTN.");
        sendHtml(adminEmail, "Signalement fiche club — FTN",
                EmailHtmlTemplates.layout("Signalement administratif", body));
    }

    @Override
    @org.springframework.scheduling.annotation.Async
    public void sendSeasonValidationRequestToCoach(
            String coachEmail,
            String coachFirstName,
            String clubName,
            String season) {
        String validationLink = appProperties.getFrontend().getBaseUrl().replaceAll("/$", "")
                + "/mon-profil?tab=club";
        String body = "<p style=\"margin:0 0 12px;\">Bonjour <strong>" + escape(coachFirstName) + "</strong>,</p>"
                + "<p style=\"margin:0 0 12px;\">La Fédération Tunisienne de Natation vous invite à valider la saison sportive "
                + "<strong>" + escape(season) + "</strong> pour votre club <strong>" + escape(clubName) + "</strong>.</p>"
                + EmailHtmlTemplates.warningBox(
                "Cette validation est nécessaire pour confirmer l'effectif et activer les licences de vos nageurs.")
                + EmailHtmlTemplates.infoBox("Club concerné", clubName)
                + EmailHtmlTemplates.infoBox("Saison", season)
                + EmailHtmlTemplates.primaryButton("Valider la saison sportive", validationLink)
                + "<p style=\"margin:16px 0 0;font-size:13px;color:#64748b;\">Vous pouvez aussi accéder à cette action depuis "
                + "Mon profil → Mon Club &amp; Affiliation.</p>";
        sendHtml(coachEmail, "Validation de saison requise — FTN",
                EmailHtmlTemplates.layout("Validation de saison", body));
    }

    @Override
    @org.springframework.scheduling.annotation.Async
    public void sendLicensePendingValidationToCoach(
            String coachEmail,
            String coachFirstName,
            String clubName,
            String season,
            String licenseNumber) {
        String validationLink = appProperties.getFrontend().getBaseUrl().replaceAll("/$", "")
                + "/mon-profil?tab=club";
        String body = "<p style=\"margin:0 0 12px;\">Bonjour <strong>" + escape(coachFirstName) + "</strong>,</p>"
                + "<p style=\"margin:0 0 12px;\">Une nouvelle licence est en attente de validation pour votre club <strong>" + escape(clubName) + "</strong>.</p>"
                + EmailHtmlTemplates.infoBox("Numéro de Licence", licenseNumber)
                + EmailHtmlTemplates.infoBox("Club concerné", clubName)
                + EmailHtmlTemplates.infoBox("Saison", season)
                + EmailHtmlTemplates.warningBox(
                "Veuillez valider la saison sportive correspondante afin d'activer cette licence et celles de vos autres nageurs.")
                + EmailHtmlTemplates.primaryButton("Accéder à la validation", validationLink);
        sendHtml(coachEmail, "Licence en attente de validation — FTN",
                EmailHtmlTemplates.layout("Licence en attente de validation", body));
    }

    @Override
    @org.springframework.scheduling.annotation.Async
    public void sendSeasonValidationDecisionToAdmin(
            String adminEmail,
            String coachName,
            String clubName,
            String season,
            boolean approved) {
        String status = approved ? "VALIDATED" : "REFUSED";
        String statusLabel = approved ? "VALIDÉE" : "REFUSÉE";
        String body = "<p style=\"margin:0 0 12px;\">Bonjour,</p>"
                + "<p style=\"margin:0 0 12px;\">Le coach <strong>" + escape(coachName) + "</strong> a pris une décision concernant la validation de saison pour son club <strong>" + escape(clubName) + "</strong>.</p>"
                + EmailHtmlTemplates.infoBox("Club", clubName)
                + EmailHtmlTemplates.infoBox("Saison", season)
                + EmailHtmlTemplates.infoBox("Décision", approved ? "Acceptée" : "Refusée")
                + EmailHtmlTemplates.infoBox("Statut final des licences", status);
        sendHtml(adminEmail, "Décision de validation de saison : " + statusLabel + " — FTN",
                EmailHtmlTemplates.layout("Décision de validation de saison", body));
    }

    @Override
    @org.springframework.scheduling.annotation.Async
    public void sendSwimmerSeasonValidationRequest(
            String email,
            String swimmerName,
            String season) {
        String validationLink = appProperties.getFrontend().getBaseUrl().replaceAll("/$", "")
                + "/mon-profil";
        String body = "<p style=\"margin:0 0 12px;\">Bonjour <strong>" + escape(swimmerName) + "</strong>,</p>"
                + "<p style=\"margin:0 0 12px;\">La Fédération Tunisienne de Natation vous invite à valider la saison sportive "
                + "<strong>" + escape(season) + "</strong> afin de renouveler votre licence individuelle.</p>"
                + EmailHtmlTemplates.warningBox(
                "Cette validation est nécessaire pour confirmer vos informations et activer votre licence individuelle de nageur indépendant.")
                + EmailHtmlTemplates.infoBox("Saison", season)
                + EmailHtmlTemplates.primaryButton("Valider ma saison sportive", validationLink);
        sendHtml(email, "Validation de saison requise (Indépendant) — FTN",
                EmailHtmlTemplates.layout("Validation de saison", body));
    }

    private String buildResetLink(String token, boolean accountSetup) {
        String base = appProperties.getFrontend().getBaseUrl().replaceAll("/$", "");
        String path = accountSetup ? "/auth/reset-password?setup=1&token=" : "/auth/reset-password?token=";
        return base + path + token;
    }

    private void sendHtml(String to, String subject, String html) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(appProperties.getMail().getFrom());
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(message);
            LOGGER.info("Email '{}' envoyé à {}", subject, to);
        } catch (Exception e) {
            LOGGER.error("Impossible d'envoyer l'email '{}' à {} (Erreur SMTP/Réseau ignorée pour éviter de bloquer la transaction) : {}", subject, to, e.getMessage());
        }
    }

    private static String escape(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
