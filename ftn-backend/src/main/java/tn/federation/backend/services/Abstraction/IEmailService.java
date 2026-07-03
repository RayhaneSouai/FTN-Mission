package tn.federation.backend.services.Abstraction;

import tn.federation.backend.entities.User;

public interface IEmailService {
    void sendPasswordReset(String to, String token);
    void sendPasswordChangedNotification(String to);
    void sendPasswordResetLink(String to, String token);
    void sendRegistrationPendingAdmin(User user);
    void sendRegistrationDecision(String to, boolean approved);

    void sendAdminCreatedUserWelcome(String to, String firstName, String temporaryPassword, String setupToken);

    void sendFormationRegistrationPendingAdmin(String swimmerName, String swimmerEmail, String programTitle, String brevetType);

    void sendFormationCertificateReady(String to, String programTitle);
}
