package tn.federation.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import tn.federation.backend.entities.Role;
import tn.federation.backend.entities.User;
import tn.federation.backend.repositories.UserRepository;
import tn.federation.backend.repositories.ClubRepository;

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

    public DataInitializer(UserRepository userRepository, ClubRepository clubRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.clubRepository = clubRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Créer ou réinitialiser l'utilisateur ADMIN par défaut
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
        userRepository.save(admin);
        System.out.println("✅ Compte ADMIN prêt (admin@ftn.tn / admin123)");

        // Créer un club par défaut s'il n'en existe aucun
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
