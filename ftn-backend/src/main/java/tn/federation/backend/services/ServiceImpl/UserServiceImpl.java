package tn.federation.backend.services.ServiceImpl;

import tn.federation.backend.services.Abstraction.IUserService;
import tn.federation.backend.services.Abstraction.IEmailService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.federation.backend.dto.AthleteProgressDTO;
import tn.federation.backend.dto.PerformanceDTO;
import tn.federation.backend.config.AppSecurityProperties;
import tn.federation.backend.dto.AdminUserCreateRequestDTO;
import tn.federation.backend.dto.AdminUserCreateResponseDTO;
import tn.federation.backend.dto.BulkUserImportResponseDTO;
import tn.federation.backend.dto.UserImportRowResultDTO;
import tn.federation.backend.dto.UserDTO;
import tn.federation.backend.entities.TokenPurpose;
import tn.federation.backend.services.Abstraction.IPasswordTokenService;
import tn.federation.backend.util.PasswordPolicyValidator;
import tn.federation.backend.util.SecurePasswordGenerator;
import tn.federation.backend.entities.Performance;
import tn.federation.backend.entities.Club;
import tn.federation.backend.entities.Role;
import tn.federation.backend.entities.User;
import tn.federation.backend.entities.RegistrationStatus;
import tn.federation.backend.repositories.ClubRepository;
import tn.federation.backend.repositories.ParticipationRepository;
import tn.federation.backend.repositories.PerformanceRepository;
import tn.federation.backend.repositories.PressFavoriteRepository;
import tn.federation.backend.repositories.UserRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements IUserService {
    private final UserRepository userRepository;
    private final PerformanceRepository performanceRepository;
    private final ClubRepository clubRepository;
    private final PasswordEncoder passwordEncoder;
    private final IEmailService emailService;
    private final SecurePasswordGenerator securePasswordGenerator;
    private final IPasswordTokenService passwordTokenService;
    private final PasswordPolicyValidator passwordPolicyValidator;
    private final AppSecurityProperties appProperties;
    private final ParticipationRepository participationRepository;
    private final PressFavoriteRepository favoriteRepository;

    public UserServiceImpl(UserRepository userRepository,
                           PerformanceRepository performanceRepository,
                           ClubRepository clubRepository,
                           PasswordEncoder passwordEncoder,
                           IEmailService emailService,
                           SecurePasswordGenerator securePasswordGenerator,
                           IPasswordTokenService passwordTokenService,
                           PasswordPolicyValidator passwordPolicyValidator,
                           AppSecurityProperties appProperties,
                           ParticipationRepository participationRepository,
                           PressFavoriteRepository favoriteRepository) {
        this.userRepository = userRepository;
        this.performanceRepository = performanceRepository;
        this.clubRepository = clubRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.securePasswordGenerator = securePasswordGenerator;
        this.passwordTokenService = passwordTokenService;
        this.passwordPolicyValidator = passwordPolicyValidator;
        this.appProperties = appProperties;
        this.participationRepository = participationRepository;
        this.favoriteRepository = favoriteRepository;
    }

    public List<UserDTO> findAllUsers() {
        return userRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<UserDTO> findSwimmers() {
        return userRepository.findByRole(Role.SWIMMER).stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public UserDTO findById(Long id) {
        return userRepository.findById(id).map(this::mapToDTO)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable avec id: " + id));
    }

    public UserDTO findByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(this::mapToDTO)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable avec email: " + email));
    }

    public AdminUserCreateResponseDTO createUser(AdminUserCreateRequestDTO request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email déjà utilisé");
        }

        if ((request.getRole() == Role.SWIMMER || request.getRole() == Role.COACH) && request.getClubId() == null) {
            throw new IllegalArgumentException("Un nageur ou un coach doit obligatoirement être rattaché à un club.");
        }

        String plainPassword = resolveAdminPassword(request.getPassword());
        User user = toEntityFromAdminRequest(request);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(plainPassword));
        user.setCreatedAt(LocalDateTime.now());
        user.setActive(true);
        user.setRegistrationStatus(RegistrationStatus.CONFIRMEE);
        user.setMustChangePassword(true);

        User saved = userRepository.save(user);

        if (saved.getRole() == Role.COACH && saved.getClub() != null) {
            Club club = saved.getClub();
            club.setCoach(saved);
            clubRepository.save(club);
        }

        String setupToken = passwordTokenService.createToken(
                email,
                TokenPurpose.ACCOUNT_SETUP,
                appProperties.getSecurity().getAccountSetupHours());

        boolean emailSent = false;
        try {
            emailService.sendAdminCreatedUserWelcome(
                    saved.getEmail(),
                    saved.getFirstName(),
                    plainPassword,
                    setupToken);
            emailSent = true;
        } catch (Exception e) {
            // User is created; admin can resend setup link later if needed
        }

        String message = emailSent
                ? "Utilisateur créé. Un email avec les identifiants et le lien de configuration a été envoyé."
                : "Utilisateur créé, mais l'email de bienvenue n'a pas pu être envoyé. Vérifiez la configuration mail.";

        return new AdminUserCreateResponseDTO(mapToDTO(saved), emailSent, message);
    }

    @Override
    @Transactional
    public BulkUserImportResponseDTO importUsers(List<AdminUserCreateRequestDTO> users) {
        BulkUserImportResponseDTO response = new BulkUserImportResponseDTO();
        response.setTotal(users.size());
        int success = 0;
        int failure = 0;
        List<UserImportRowResultDTO> results = new java.util.ArrayList<>();

        for (int i = 0; i < users.size(); i++) {
            AdminUserCreateRequestDTO row = users.get(i);
            int rowNumber = i + 2;
            String email = row.getEmail() != null ? row.getEmail().trim().toLowerCase() : "";
            try {
                AdminUserCreateResponseDTO createResp = createImportedUser(row);
                success++;
                results.add(new UserImportRowResultDTO(
                        rowNumber,
                        email,
                        true,
                        createResp.getMessage()));
            } catch (Exception ex) {
                failure++;
                String msg = ex.getMessage() != null ? ex.getMessage() : "Erreur lors de la création";
                results.add(new UserImportRowResultDTO(rowNumber, email, false, msg));
            }
        }

        response.setSuccessCount(success);
        response.setFailureCount(failure);
        response.setResults(results);
        return response;
    }

    /**
     * Création via import CSV : pas de statut dans le fichier, compte inactif en attente de validation admin.
     */
    private AdminUserCreateResponseDTO createImportedUser(AdminUserCreateRequestDTO request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email déjà utilisé");
        }

        String plainPassword = resolveAdminPassword(request.getPassword());
        User user = toEntityFromAdminRequest(request);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(plainPassword));
        user.setCreatedAt(LocalDateTime.now());
        user.setActive(false);
        user.setRegistrationStatus(RegistrationStatus.EN_ATTENTE);
        user.setMustChangePassword(true);

        User saved = userRepository.save(user);

        return new AdminUserCreateResponseDTO(
                mapToDTO(saved),
                false,
                "Utilisateur importé — en attente de validation dans la liste des utilisateurs.");
    }

    private String resolveAdminPassword(String requestedPassword) {
        if (requestedPassword != null && !requestedPassword.isBlank()) {
            passwordPolicyValidator.validate(requestedPassword);
            return requestedPassword;
        }
        return securePasswordGenerator.generate();
    }

    public UserDTO approveUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));
        
        if ((user.getRole() == Role.SWIMMER || user.getRole() == Role.COACH) && user.getClub() == null) {
            throw new IllegalArgumentException("Impossible d'approuver un utilisateur sans club associé.");
        }

        user.setActive(true);
        user.setRegistrationStatus(RegistrationStatus.CONFIRMEE);
        User saved = userRepository.save(user);
        emailService.sendRegistrationDecision(user.getEmail(), true);
        return mapToDTO(saved);
    }

    public UserDTO rejectUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));
        user.setActive(false);
        user.setRegistrationStatus(RegistrationStatus.ANNULEE);
        emailService.sendRegistrationDecision(user.getEmail(), false);
        return mapToDTO(userRepository.save(user));
    }

    public UserDTO updateUser(Long id, UserDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable avec id: " + id));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = auth.getName();
        boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin && !user.getEmail().equals(currentEmail)) {
            throw new org.springframework.security.access.AccessDeniedException("Vous n'êtes pas autorisé à modifier ce profil.");
        }

        if (user.getRegistrationStatus() == RegistrationStatus.ANNULEE) {
            throw new IllegalArgumentException("Modification interdite : cette inscription a été refusée.");
        }

        // Common fields (anyone can update their own)
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setBirthDate(dto.getBirthDate());
        user.setGender(convertToGender(dto.getGender()));
        user.setNiveau(convertToNiveau(dto.getNiveau()));
        user.setDiscipline(convertToDiscipline(dto.getDiscipline()));
        user.setAnciennete(dto.getAnciennete());

        Role targetRole = isAdmin ? dto.getRole() : user.getRole();

        if (dto.getClubId() != null) {
            Club club = clubRepository.findById(dto.getClubId()).orElse(null);
            user.setClub(club);
            if (user.getRole() == Role.COACH && club != null) {
                club.setCoach(user);
                clubRepository.save(club);
            }
        } else if (dto.getClubName() == null) {
            if (targetRole == Role.SWIMMER || targetRole == Role.COACH) {
                throw new IllegalArgumentException("Un nageur ou un coach doit obligatoirement être rattaché à un club.");
            }
            user.setClub(null);
        }

        // Sensitive fields (Admin only)
        if (isAdmin) {
            user.setEmail(dto.getEmail());
            user.setRole(dto.getRole());
            user.setActive(dto.getActive());

            if (dto.getRegistrationStatus() != null && !dto.getRegistrationStatus().isBlank()) {
                try {
                    user.setRegistrationStatus(RegistrationStatus.valueOf(dto.getRegistrationStatus().trim().toUpperCase()));
                } catch (IllegalArgumentException e) {
                    throw new IllegalArgumentException("Statut d'inscription invalide: " + dto.getRegistrationStatus());
                }
            }
        }

        if ((user.getRole() == Role.SWIMMER || user.getRole() == Role.COACH) && user.getClub() == null) {
            throw new IllegalArgumentException("Un nageur ou un coach doit obligatoirement être rattaché à un club.");
        }

        User saved = userRepository.save(user);

        if (saved.getRole() == Role.COACH && saved.getClub() != null) {
            Club club = saved.getClub();
            club.setCoach(saved);
            clubRepository.save(club);
        }

        return mapToDTO(saved);
    }

    private tn.federation.backend.entities.Gender convertToGender(String genderStr) {
        if (genderStr == null || genderStr.trim().isEmpty()) {
            return null;
        }
        try {
            return tn.federation.backend.entities.Gender.valueOf(genderStr.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Genre invalide: '" + genderStr + "'. Valeurs acceptées: HOMME, FEMME");
        }
    }

    private tn.federation.backend.entities.Niveau convertToNiveau(String niveauStr) {
        if (niveauStr == null || niveauStr.trim().isEmpty()) {
            return null;
        }
        try {
            return tn.federation.backend.entities.Niveau.valueOf(niveauStr.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Niveau invalide: '" + niveauStr + "'. Valeurs acceptées: POUSSIN, BENJAMIN, MINIME, CADET, JUNIOR, SENIOR, MASTER");
        }
    }

    private tn.federation.backend.entities.Discipline convertToDiscipline(String disciplineStr) {
        if (disciplineStr == null || disciplineStr.trim().isEmpty()) {
            return null;
        }
        String normalized = disciplineStr.trim().toUpperCase()
                .replace("-", "_")
                .replace(" ", "_");
        try {
            return tn.federation.backend.entities.Discipline.valueOf(normalized);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Discipline invalide: '" + disciplineStr + "'. Valeurs acceptées: NATATION, EAU_LIBRE, WATER_POLO, PLONGEON, NAGE_SYNCHRONISEE");
        }
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new IllegalArgumentException("Utilisateur introuvable avec id: " + id);
        }
        userRepository.deleteById(id);
    }

    public AthleteProgressDTO getAthleteProgress(Long swimmerId) {
        if (!userRepository.existsById(swimmerId)) {
            throw new IllegalArgumentException("Nageur introuvable avec id: " + swimmerId);
        }
        List<PerformanceDTO> performances = performanceRepository.findBySwimmerIdOrderByDateAsc(swimmerId).stream()
                .map(this::mapPerformanceToDTO)
                .collect(Collectors.toList());

        AthleteProgressDTO progressDTO = new AthleteProgressDTO();
        progressDTO.setSwimmerId(swimmerId);
        progressDTO.setPerformances(performances);
        return progressDTO;
    }

    public tn.federation.backend.dto.SwimmerDashboardDTO getSwimmerDashboardStats(Long swimmerId) {
        if (!userRepository.existsById(swimmerId)) {
            throw new IllegalArgumentException("Nageur introuvable avec id: " + swimmerId);
        }
        User swimmer = userRepository.findById(swimmerId).get();

        long participations = participationRepository.countBySwimmerId(swimmerId);
        long performances = performanceRepository.countBySwimmerId(swimmerId);
        long favorites = favoriteRepository.countByUserId(swimmerId);
        boolean hasLicense = swimmer.getLicense() != null && "VALIDATED".equals(swimmer.getLicense().getValidationStatus());

        return tn.federation.backend.dto.SwimmerDashboardDTO.builder()
                .totalParticipations(participations)
                .totalPerformances(performances)
                .totalFavorites(favorites)
                .hasActiveLicense(hasLicense)
                .build();
    }

    public tn.federation.backend.dto.AdminDashboardDTO getAdminDashboardStats() {
        long totalUsers = userRepository.count();
        long activeLicenses = userRepository.findAll().stream()
                .filter(u -> RegistrationStatus.CONFIRMEE.equals(u.getRegistrationStatus())).count();
        long pendingRequests = userRepository.findAll().stream()
                .filter(u -> RegistrationStatus.EN_ATTENTE.equals(u.getRegistrationStatus())).count();
        long affiliatedClubs = clubRepository.count();

        return tn.federation.backend.dto.AdminDashboardDTO.builder()
                .totalUsers(totalUsers)
                .activeLicenses(activeLicenses)
                .pendingRequests(pendingRequests)
                .affiliatedClubs(affiliatedClubs)
                .build();
    }

    private PerformanceDTO mapPerformanceToDTO(Performance performance) {
        PerformanceDTO dto = new PerformanceDTO();
        dto.setTime(performance.getTime());
        dto.setDistance(performance.getDistance());
        dto.setStroke(performance.getStroke());
        dto.setDate(performance.getDate());
        dto.setId(performance.getId());
        return dto;
    }

    public UserDTO mapToDTO(User user) {
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
        dto.setCreatedAt(user.getCreatedAt());
        dto.setMustChangePassword(user.getMustChangePassword());

        if (user.getClub() != null) {
            dto.setClubId(user.getClub().getId());
            dto.setClubName(user.getClub().getName());
            dto.setClubRegion(user.getClub().getRegion());
            dto.setClubManager(user.getClub().getManager());
            dto.setClubContact(user.getClub().getContact());
            dto.setClubAffiliationDate(user.getClub().getAffiliationDate());
        }

        if (user.getLicense() != null) {
            dto.setLicenseId(user.getLicense().getId());
            dto.setLicenseNumber(user.getLicense().getLicenseNumber());
            dto.setLicenseValidationStatus(user.getLicense().getValidationStatus());
        }

        return dto;
    }

    public User toEntityFromAdminRequest(AdminUserCreateRequestDTO request) {
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(request.getRole());
        user.setBirthDate(request.getBirthDate());
        user.setGender(convertToGender(request.getGender()));
        user.setNiveau(convertToNiveau(request.getNiveau()));
        user.setDiscipline(convertToDiscipline(request.getDiscipline()));
        user.setAnciennete(request.getAnciennete());
        if (request.getClubId() != null) {
            user.setClub(resolveClub(request.getClubId()));
        }
        return user;
    }

    private Club resolveClub(Long clubId) {
        return clubRepository.findById(clubId)
                .orElseThrow(() -> new IllegalArgumentException("Club introuvable avec id: " + clubId));
    }

    public void changePassword(String currentEmail, String oldPassword, String newPassword) {
        passwordPolicyValidator.validate(newPassword);

        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable avec l'email: " + currentEmail));

        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("L'ancien mot de passe est incorrect");
        }

        if (passwordEncoder.matches(newPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("Le nouveau mot de passe doit être différent de l'ancien mot de passe.");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setMustChangePassword(false);
        userRepository.save(user);

        emailService.sendPasswordChangedNotification(user.getEmail());
    }
}