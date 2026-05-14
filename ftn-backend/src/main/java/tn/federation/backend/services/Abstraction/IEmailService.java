package tn.federation.backend.services.Abstraction;

public interface IEmailService {
    void sendPasswordReset(String to, String token);
}
