package tn.federation.backend.services.ServiceImpl;

import tn.federation.backend.config.AppSecurityProperties;
import tn.federation.backend.entities.AccountToken;
import tn.federation.backend.entities.TokenPurpose;
import tn.federation.backend.services.Abstraction.IAuthService;
import tn.federation.backend.services.Abstraction.IEmailService;
import tn.federation.backend.services.Abstraction.IPasswordTokenService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.federation.backend.config.JwtService;
import tn.federation.backend.dto.AuthResponseDTO;
import tn.federation.backend.dto.LoginRequestDTO;
import tn.federation.backend.dto.PasswordResetDTO;
import tn.federation.backend.dto.PasswordResetRequestDTO;
import tn.federation.backend.dto.PasswordResetTokenInfoDTO;
import tn.federation.backend.dto.RegisterRequestDTO;
import tn.federation.backend.dto.UserDTO;
import tn.federation.backend.entities.RegistrationStatus;
import tn.federation.backend.entities.User;
import tn.federation.backend.repositories.UserRepository;
import tn.federation.backend.util.PasswordPolicyValidator;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuthServiceImpl implements IAuthService {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final IEmailService emailService;
    private final IPasswordTokenService passwordTokenService;
    private final PasswordPolicyValidator passwordPolicyValidator;
    private final AppSecurityProperties appProperties;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
            UserRepository userRepository,
            JwtService jwtService,
            PasswordEncoder passwordEncoder,
            IEmailService emailService,
            IPasswordTokenService passwordTokenService,
            PasswordPolicyValidator passwordPolicyValidator,
            AppSecurityProperties appProperties) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.passwordTokenService = passwordTokenService;
        this.passwordPolicyValidator = passwordPolicyValidator;
        this.appProperties = appProperties;
    }

    public AuthResponseDTO login(LoginRequestDTO request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (AuthenticationException ex) {
            throw new IllegalArgumentException("Email ou mot de passe incorrect");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Utilisateur introuvable avec email: " + request.getEmail()));

        if (Boolean.TRUE.equals(user.getMustChangePassword())) {
            throw new IllegalArgumentException(
                    "Vous devez configurer votre mot de passe via le lien reçu par email avant de vous connecter.");
        }

        RegistrationStatus reg = user.getRegistrationStatus();
        if (reg == RegistrationStatus.EN_ATTENTE) {
            throw new IllegalArgumentException(
                    "Votre compte est en attente de validation par un administrateur. Vous recevrez un accès après approbation.");
        }
        if (reg == RegistrationStatus.ANNULEE) {
            throw new IllegalArgumentException(
                    "Cette inscription a été refusée. Contactez l'administration pour plus d'informations.");
        }
        if (Boolean.FALSE.equals(user.getActive())) {
            throw new IllegalArgumentException("Ce compte a été désactivé.");
        }

        boolean jwtEnabled = user.getActive() != null ? user.getActive() : true;
        String token = jwtService.generateToken(new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                jwtEnabled,
                true,
                true,
                true,
                List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority(
                        "ROLE_" + user.getRole().name()))));

        return new AuthResponseDTO(token, mapToDTO(user));
    }

    public AuthResponseDTO register(RegisterRequestDTO request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email déjà utilisé");
        }
        passwordPolicyValidator.validate(request.getPassword());

        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setRole(request.getRole());
        user.setActive(false);
        user.setRegistrationStatus(RegistrationStatus.EN_ATTENTE);
        user.setCreatedAt(LocalDateTime.now());
        user.setMustChangePassword(false);
        user.setBirthDate(request.getBirthDate());
        user.setGender(parseGender(request.getGender()));
        user.setNiveau(parseNiveau(request.getNiveau()));
        user.setDiscipline(parseDiscipline(request.getDiscipline()));
        user.setAnciennete(request.getAnciennete());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));

        userRepository.save(user);
        emailService.sendRegistrationPendingAdmin(user);

        String token = jwtService.generateToken(new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPasswordHash(),
                true, true, true, true,
                List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority(
                        "ROLE_" + user.getRole().name()))));

        return new AuthResponseDTO(token, mapToDTO(user));
    }

    public void requestPasswordReset(PasswordResetRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Utilisateur introuvable avec email: " + request.getEmail()));

        String token = passwordTokenService.createToken(
                user.getEmail(),
                TokenPurpose.PASSWORD_RESET,
                appProperties.getSecurity().getPasswordResetHours());
        emailService.sendPasswordReset(user.getEmail(), token);
    }

    @Override
    @Transactional
    public void resetPassword(PasswordResetDTO request) {
        passwordPolicyValidator.validate(request.getNewPassword());
        AccountToken tokenData = passwordTokenService.requireValidToken(request.getToken());

        User user = userRepository.findByEmail(tokenData.getEmail())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Utilisateur introuvable avec email: " + tokenData.getEmail()));

        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Le nouveau mot de passe doit être différent de l'ancien mot de passe.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setMustChangePassword(false);
        userRepository.save(user);
        passwordTokenService.markTokenUsed(tokenData);
        emailService.sendPasswordChangedNotification(user.getEmail());
    }

    @Override
    public PasswordResetTokenInfoDTO validateResetToken(String token) {
        try {
            AccountToken accountToken = passwordTokenService.requireValidToken(token);
            return new PasswordResetTokenInfoDTO(
                    true,
                    accountToken.getPurpose() == TokenPurpose.ACCOUNT_SETUP,
                    maskEmail(accountToken.getEmail()),
                    "Token valide.");
        } catch (IllegalArgumentException ex) {
            return new PasswordResetTokenInfoDTO(false, false, null, ex.getMessage());
        }
    }

    private UserDTO mapToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setActive(user.getActive());
        dto.setBirthDate(user.getBirthDate());
        dto.setGender(user.getGender() != null ? user.getGender().name() : null);
        dto.setNiveau(user.getNiveau() != null ? user.getNiveau().name() : null);
        dto.setDiscipline(user.getDiscipline() != null ? user.getDiscipline().name() : null);
        dto.setAnciennete(user.getAnciennete());
        dto.setRegistrationStatus(user.getRegistrationStatus() != null ? user.getRegistrationStatus().name() : null);
        dto.setMustChangePassword(user.getMustChangePassword());
        return dto;
    }

    private static String maskEmail(String email) {
        if (email == null || !email.contains("@")) {
            return null;
        }
        int at = email.indexOf('@');
        if (at <= 1) {
            return "***" + email.substring(at);
        }
        return email.charAt(0) + "***" + email.substring(at);
    }

    private tn.federation.backend.entities.Gender parseGender(String genderStr) {
        if (genderStr == null || genderStr.trim().isEmpty()) {
            return null;
        }
        return tn.federation.backend.entities.Gender.valueOf(genderStr.trim().toUpperCase());
    }

    private tn.federation.backend.entities.Niveau parseNiveau(String niveauStr) {
        if (niveauStr == null || niveauStr.trim().isEmpty()) {
            return null;
        }
        return tn.federation.backend.entities.Niveau.valueOf(niveauStr.trim().toUpperCase());
    }

    private tn.federation.backend.entities.Discipline parseDiscipline(String disciplineStr) {
        if (disciplineStr == null || disciplineStr.trim().isEmpty()) {
            return null;
        }
        return tn.federation.backend.entities.Discipline.valueOf(disciplineStr.trim().toUpperCase());
    }
}
