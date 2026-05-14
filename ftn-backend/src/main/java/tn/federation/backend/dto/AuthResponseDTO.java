package tn.federation.backend.dto;

public class AuthResponseDTO {
    private String token;
    private String tokenType = "Bearer";
    private UserDTO user;

    public AuthResponseDTO(String token, UserDTO user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public UserDTO getUser() {
        return user;
    }

    public void setUser(UserDTO user) {
        this.user = user;
    }
}
