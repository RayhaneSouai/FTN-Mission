package tn.federation.backend.dto;

public class AdminUserCreateResponseDTO {
    private UserDTO user;
    private boolean welcomeEmailSent;
    private String message;

    public AdminUserCreateResponseDTO(UserDTO user, boolean welcomeEmailSent, String message) {
        this.user = user;
        this.welcomeEmailSent = welcomeEmailSent;
        this.message = message;
    }

    public UserDTO getUser() {
        return user;
    }

    public void setUser(UserDTO user) {
        this.user = user;
    }

    public boolean isWelcomeEmailSent() {
        return welcomeEmailSent;
    }

    public void setWelcomeEmailSent(boolean welcomeEmailSent) {
        this.welcomeEmailSent = welcomeEmailSent;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
