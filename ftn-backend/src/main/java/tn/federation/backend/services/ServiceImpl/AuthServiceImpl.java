package tn.federation.backend.services.ServiceImpl;

import tn.federation.backend.services.Abstraction.IAuthService;
import tn.federation.backend.services.Abstraction.IEmailService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import tn.federation.backend.config.JwtService;
import java.util.List;
import tn.federation.backend.dto.AuthResponseDTO;
import tn.federation.backend.dto.LoginRequestDTO;
import tn.federation.backend.dto.PasswordResetDTO;
import tn.federation.backend.dto.PasswordResetRequestDTO;
import tn.federation.backend.dto.RegisterRequestDTO;
import tn.federation.backend.dto.UserDTO;
import tn.federation.backend.entities.RegistrationStatus;
import tn.federation.backend.entities.User;
import tn.federation.backend.repositories.UserRepository;
import java.time.LocalDateTime;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthServiceImpl implements IAuthService {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final IEmailService emailService;

    private final Map<String, PasswordResetToken> resetTokens = new ConcurrentHashMap<>();

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       JwtService jwtService,
                       PasswordEncoder passwordEncoder,
                       IEmailService emailService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    public AuthResponseDTO login(LoginRequestDTO request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (AuthenticationException ex) {
            throw new IllegalArgumentException("Email ou mot de passe incorrect");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable avec email: " + request.getEmail()));

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
                List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        ));

        UserDTO userDTO = mapToDTO(user);

        return new AuthResponseDTO(token, userDTO);
    }

    public AuthResponseDTO register(RegisterRequestDTO request) {
        try {
            System.out.println("DEBUG: AuthServiceImpl.register called for email: " + request.getEmail());
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Email déjà utilisé");
            }
            User user = new User();
            user.setFirstName(request.getFirstName());
            user.setLastName(request.getLastName());
            user.setEmail(request.getEmail());
            user.setRole(request.getRole());
            
            user.setActive(false);
            user.setRegistrationStatus(RegistrationStatus.EN_ATTENTE);
            user.setCreatedAt(LocalDateTime.now());
            System.out.println("DEBUG: Setting user to INACTIVE and EN_ATTENTE");
            
            user.setBirthDate(request.getBirthDate());
            user.setGender(request.getGender() != null && !request.getGender().trim().isEmpty() ? tn.federation.backend.entities.Gender.valueOf(request.getGender().trim().toUpperCase()) : null);
            user.setNiveau(request.getNiveau() != null && !request.getNiveau().trim().isEmpty() ? tn.federation.backend.entities.Niveau.valueOf(request.getNiveau().trim().toUpperCase()) : null);
            user.setDiscipline(request.getDiscipline() != null && !request.getDiscipline().trim().isEmpty() ? tn.federation.backend.entities.Discipline.valueOf(request.getDiscipline().trim().toUpperCase()) : null);
            user.setAnciennete(request.getAnciennete());
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            
            userRepository.save(user);
            return new AuthResponseDTO(null, mapToDTO(user));
        } catch (Exception e) {
            e.printStackTrace();
            throw new IllegalArgumentException("Erreur d'inscription: " + e.getMessage());
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
        return dto;
    }

    public void requestPasswordReset(PasswordResetRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable avec email: " + request.getEmail()));

        String token = UUID.randomUUID().toString();
        resetTokens.put(token, new PasswordResetToken(user.getEmail(), Instant.now().plusSeconds(900)));
        emailService.sendPasswordReset(user.getEmail(), token);
    }

    public void resetPassword(PasswordResetDTO request) {
        PasswordResetToken tokenData = resetTokens.get(request.getToken());
        if (tokenData == null || tokenData.getExpiry().isBefore(Instant.now())) {
            throw new IllegalArgumentException("Token invalide ou expiré");
        }

        User user = userRepository.findByEmail(tokenData.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable avec email: " + tokenData.getEmail()));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        resetTokens.remove(request.getToken());
    }

    private static class PasswordResetToken {
        private final String email;
        private final Instant expiry;

        public PasswordResetToken(String email, Instant expiry) {
            this.email = email;
            this.expiry = expiry;
        }

        public String getEmail() {
            return email;
        }

        public Instant getExpiry() {
            return expiry;
        }
    }
}
