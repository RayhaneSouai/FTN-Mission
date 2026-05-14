package tn.federation.backend.services.ServiceImpl;

import tn.federation.backend.services.Abstraction.IEmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements IEmailService {
    private static final Logger LOGGER = LoggerFactory.getLogger(EmailServiceImpl.class);
    private final JavaMailSender mailSender;

    public EmailServiceImpl(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordReset(String to, String token) {
        String subject = "Réinitialisation de mot de passe FTN";
        String text = "Utilisez ce token pour réinitialiser votre mot de passe: " + token;

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
        } catch (Exception e) {
            LOGGER.warn("Impossible d'envoyer l'email, token de réinitialisation: {}", token, e);
        }
    }
}
