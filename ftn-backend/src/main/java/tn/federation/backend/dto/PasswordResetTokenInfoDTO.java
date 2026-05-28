package tn.federation.backend.dto;

public class PasswordResetTokenInfoDTO {
    private boolean valid;
    private boolean accountSetup;
    private String emailHint;
    private String message;

    public PasswordResetTokenInfoDTO(boolean valid, boolean accountSetup, String emailHint, String message) {
        this.valid = valid;
        this.accountSetup = accountSetup;
        this.emailHint = emailHint;
        this.message = message;
    }

    public boolean isValid() {
        return valid;
    }

    public void setValid(boolean valid) {
        this.valid = valid;
    }

    public boolean isAccountSetup() {
        return accountSetup;
    }

    public void setAccountSetup(boolean accountSetup) {
        this.accountSetup = accountSetup;
    }

    public String getEmailHint() {
        return emailHint;
    }

    public void setEmailHint(String emailHint) {
        this.emailHint = emailHint;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
