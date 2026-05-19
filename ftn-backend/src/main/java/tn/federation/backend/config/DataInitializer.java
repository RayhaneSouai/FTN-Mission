package tn.federation.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import tn.federation.backend.entities.Discipline;
import tn.federation.backend.entities.Gender;
import tn.federation.backend.entities.Niveau;
import tn.federation.backend.entities.RegistrationStatus;
import tn.federation.backend.entities.Role;
import tn.federation.backend.entities.User;
import tn.federation.backend.repositories.UserRepository;
import tn.federation.backend.repositories.ClubRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final ClubRepository clubRepository;
    private final PasswordEncoder passwordEncoder;
    
    private static final String ADMIN_EMAIL = "admin@ftn.tn";
    private static final String ADMIN_PASSWORD = "admin123";
    private static final String ADMIN_FIRST_NAME = "Admin";
    private static final String ADMIN_LAST_NAME = "FTN";

    private static final String SWIMMER_EMAIL = "nageur@ftn.tn";
    private static final String SWIMMER_PASSWORD = "nageur123";

    public DataInitializer(UserRepository userRepository, ClubRepository clubRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.clubRepository = clubRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // ── ADMIN ─────────────────────────────────────────────────
        User admin = userRepository.findByEmail(ADMIN_EMAIL).orElse(null);
        if (admin == null) {
            admin = new User();
            admin.setFirstName(ADMIN_FIRST_NAME);
            admin.setLastName(ADMIN_LAST_NAME);
            admin.setEmail(ADMIN_EMAIL);
            admin.setCreatedAt(LocalDateTime.now());
            System.out.println("✅ Création du compte ADMIN...");
        } else {
            System.out.println("🔄 Réinitialisation du mot de passe ADMIN...");
        }
        admin.setPasswordHash(passwordEncoder.encode(ADMIN_PASSWORD));
        admin.setRole(Role.ADMIN);
        admin.setActive(true);
        admin.setRegistrationStatus(RegistrationStatus.CONFIRMEE);
        userRepository.save(admin);
        System.out.println("✅ Compte ADMIN prêt (admin@ftn.tn / admin123)");

        // ── SWIMMER de test ────────────────────────────────────────
        User swimmer = userRepository.findByEmail(SWIMMER_EMAIL).orElse(null);
        if (swimmer == null) {
            swimmer = new User();
            swimmer.setFirstName("Ahmed");
            swimmer.setLastName("Ben Salah");
            swimmer.setEmail(SWIMMER_EMAIL);
            swimmer.setCreatedAt(LocalDateTime.now());
            swimmer.setBirthDate(LocalDate.of(2002, 5, 15));
            swimmer.setGender(Gender.HOMME);
            swimmer.setNiveau(Niveau.SENIOR);
            swimmer.setDiscipline(Discipline.NATATION);
            System.out.println("✅ Création du compte SWIMMER de test...");
        } else {
            System.out.println("🔄 Réinitialisation du mot de passe SWIMMER...");
        }
        swimmer.setPasswordHash(passwordEncoder.encode(SWIMMER_PASSWORD));
        swimmer.setRole(Role.SWIMMER);
        swimmer.setActive(true);
        userRepository.save(swimmer);
        System.out.println("✅ Compte SWIMMER prêt (nageur@ftn.tn / nageur123)");

        // ── Club par défaut ────────────────────────────────────────
        if (clubRepository.count() == 0) {
            tn.federation.backend.entities.Club club = new tn.federation.backend.entities.Club();
            club.setName("Club Sportif de Tunis");
            club.setRegion("Tunis");
            club.setAddress("Avenue Habib Bourguiba");
            club.setContact("71 000 000");
            club.setManager("Mohamed Ben Salah");
            clubRepository.save(club);
            System.out.println("✅ Club par défaut créé avec succès!");
        }
    }
}
