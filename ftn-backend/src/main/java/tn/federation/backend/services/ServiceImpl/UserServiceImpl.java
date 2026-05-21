package tn.federation.backend.services.ServiceImpl;

import tn.federation.backend.services.Abstraction.IUserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import tn.federation.backend.dto.AthleteProgressDTO;
import tn.federation.backend.dto.PerformanceDTO;
import tn.federation.backend.dto.RegisterRequestDTO;
import tn.federation.backend.dto.UserDTO;
import tn.federation.backend.entities.Performance;
import tn.federation.backend.entities.Role;
import tn.federation.backend.entities.User;
import tn.federation.backend.entities.RegistrationStatus;
import tn.federation.backend.repositories.ClubRepository;
import tn.federation.backend.repositories.PerformanceRepository;
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

    private final tn.federation.backend.repositories.ParticipationRepository participationRepository;
    private final tn.federation.backend.repositories.PressFavoriteRepository favoriteRepository;

    public UserServiceImpl(UserRepository userRepository, PerformanceRepository performanceRepository, ClubRepository clubRepository, PasswordEncoder passwordEncoder,
                           tn.federation.backend.repositories.ParticipationRepository participationRepository,
                           tn.federation.backend.repositories.PressFavoriteRepository favoriteRepository) {
        this.userRepository = userRepository;
        this.performanceRepository = performanceRepository;
        this.clubRepository = clubRepository;
        this.passwordEncoder = passwordEncoder;
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

    public UserDTO createUser(RegisterRequestDTO request) {
        System.out.println("DEBUG: UserServiceImpl.createUser called (Admin creation) for: " + request.getEmail());
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email déjà utilisé");
        }
        User user = toEntity(request);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setCreatedAt(LocalDateTime.now());
        
        // Admin-created users are active and confirmed by default
        user.setActive(true);
        user.setRegistrationStatus(RegistrationStatus.CONFIRMEE);
        System.out.println("DEBUG: Setting admin-created user to ACTIVE and CONFIRMEE");
        
        return mapToDTO(userRepository.save(user));
    }

    public UserDTO approveUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));
        user.setActive(true);
        user.setRegistrationStatus(RegistrationStatus.CONFIRMEE);
        return mapToDTO(userRepository.save(user));
    }

    public UserDTO rejectUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));
        user.setActive(false);
        user.setRegistrationStatus(RegistrationStatus.ANNULEE);
        return mapToDTO(userRepository.save(user));
    }

    public UserDTO updateUser(Long id, UserDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable avec id: " + id));

        if (user.getRegistrationStatus() == RegistrationStatus.ANNULEE) {
            throw new IllegalArgumentException("Modification interdite : cette inscription a été refusée.");
        }

        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setEmail(dto.getEmail());
        user.setRole(dto.getRole());
        user.setActive(dto.getActive());
        user.setBirthDate(dto.getBirthDate());
        
        // Safer enum conversion with null checks
        user.setGender(convertToGender(dto.getGender()));
        user.setNiveau(convertToNiveau(dto.getNiveau()));
        user.setDiscipline(convertToDiscipline(dto.getDiscipline()));
        user.setAnciennete(dto.getAnciennete());

        if (dto.getClubId() != null) {
            user.setClub(clubRepository.findById(dto.getClubId()).orElse(null));
        } else if (dto.getClubName() == null) {
            // Only clear club if specifically requested (no clubId and no clubName info)
            user.setClub(null);
        }

        if (dto.getRegistrationStatus() != null && !dto.getRegistrationStatus().isBlank()) {
            try {
                user.setRegistrationStatus(RegistrationStatus.valueOf(dto.getRegistrationStatus().trim().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Statut d'inscription invalide: " + dto.getRegistrationStatus());
            }
        }

        return mapToDTO(userRepository.save(user));
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
        try {
            return tn.federation.backend.entities.Discipline.valueOf(disciplineStr.toUpperCase().trim());
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
        boolean hasLicense = swimmer.getActive() != null && swimmer.getActive() && swimmer.getClub() != null;

        return tn.federation.backend.dto.SwimmerDashboardDTO.builder()
                .totalParticipations(participations)
                .totalPerformances(performances)
                .totalFavorites(favorites)
                .hasActiveLicense(hasLicense)
                .build();
    }

    public tn.federation.backend.dto.AdminDashboardDTO getAdminDashboardStats() {
        long totalUsers = userRepository.count();
        long activeLicenses = userRepository.findAll().stream().filter(u -> tn.federation.backend.entities.RegistrationStatus.CONFIRMEE.equals(u.getRegistrationStatus())).count();
        long pendingRequests = userRepository.findAll().stream().filter(u -> tn.federation.backend.entities.RegistrationStatus.EN_ATTENTE.equals(u.getRegistrationStatus())).count();
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

        // Map club details
        if (user.getClub() != null) {
            dto.setClubId(user.getClub().getId());
            dto.setClubName(user.getClub().getName());
            dto.setClubRegion(user.getClub().getRegion());
            dto.setClubManager(user.getClub().getManager());
            dto.setClubContact(user.getClub().getContact());
            dto.setClubAffiliationDate(user.getClub().getAffiliationDate());
        }
        
        return dto;
    }

    public User toEntity(RegisterRequestDTO request) {
        User user = new User();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setRole(request.getRole());
        user.setBirthDate(request.getBirthDate());
        user.setGender(convertToGender(request.getGender()));
        user.setNiveau(convertToNiveau(request.getNiveau()));
        user.setDiscipline(convertToDiscipline(request.getDiscipline()));
        user.setAnciennete(request.getAnciennete());
        return user;
    }
}
