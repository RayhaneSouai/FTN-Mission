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
    public void sendRegistrationDecision(String to, boolean approved) {
        String status = approved ? "approuvée" : "refusée";
        String body = "<p>Votre demande d'inscription a été <strong>" + status + "</strong>.</p>";
        if (approved) {
            body += "<p>Vous pouvez maintenant vous connecter avec vos identifiants.</p>";
        }
        sendHtml(to, "Décision d'inscription — FTN", EmailHtmlTemplates.layout("Inscription " + status, body));
    }

    @Override
    public void sendPasswordResetLink(String to, String token) {
        sendPasswordReset(to, token);
    }

    @Override
    public void sendPasswordChangedNotification(String to) {
        String body = "<p style=\"margin:0 0 12px;\">Bonjour,</p>"
                + "<p style=\"margin:0 0 12px;\">Le mot de passe de votre compte FTN a été modifié avec succès.</p>"
                + EmailHtmlTemplates.warningBox(
                "Si vous n'êtes pas à l'origine de cette modification, contactez immédiatement l'administration.");
        sendHtml(to, "Mot de passe modifié — FTN", EmailHtmlTemplates.layout("Mot de passe modifié", body));
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
            LOGGER.warn("Impossible d'envoyer l'email '{}' à {}", subject, to, e);
            throw new IllegalStateException("Envoi d'email impossible. Vérifiez la configuration SMTP.");
        }
    }

    private static String escape(String value) {
        if (value == null) {
            return "";
        }
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
