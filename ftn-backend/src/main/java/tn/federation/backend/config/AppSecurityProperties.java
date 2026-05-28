package tn.federation.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public class AppSecurityProperties {
    private final Frontend frontend = new Frontend();
    private final Mail mail = new Mail();
    private final Security security = new Security();

    public Frontend getFrontend() {
        return frontend;
    }

    public Mail getMail() {
        return mail;
    }

    public Security getSecurity() {
        return security;
    }

    public static class Frontend {
        private String baseUrl = "http://localhost:4200";

        public String getBaseUrl() {
            return baseUrl;
        }

        public void setBaseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
        }
    }

    public static class Mail {
        private String from = "noreply@ftn.tn";

        public String getFrom() {
            return from;
        }

        public void setFrom(String from) {
            this.from = from;
        }
    }

    public static class Security {
        private long passwordResetHours = 24;
        private long accountSetupHours = 72;

        public long getPasswordResetHours() {
            return passwordResetHours;
        }

        public void setPasswordResetHours(long passwordResetHours) {
            this.passwordResetHours = passwordResetHours;
        }

        public long getAccountSetupHours() {
            return accountSetupHours;
        }

        public void setAccountSetupHours(long accountSetupHours) {
            this.accountSetupHours = accountSetupHours;
        }
    }
}
