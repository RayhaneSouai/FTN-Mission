package tn.federation.backend.services.Abstraction;

import tn.federation.backend.dto.AuthResponseDTO;
import tn.federation.backend.dto.LoginRequestDTO;
import tn.federation.backend.dto.PasswordResetDTO;
import tn.federation.backend.dto.PasswordResetRequestDTO;
import tn.federation.backend.dto.RegisterRequestDTO;

public interface IAuthService {
    AuthResponseDTO login(LoginRequestDTO request);
    AuthResponseDTO register(RegisterRequestDTO request);
    void requestPasswordReset(PasswordResetRequestDTO request);
    void resetPassword(PasswordResetDTO request);
}
