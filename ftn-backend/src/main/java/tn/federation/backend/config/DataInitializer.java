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
        boolean newAdmin = admin == null;
        if (newAdmin) {
            admin = new User();
            admin.setFirstName(ADMIN_FIRST_NAME);
            admin.setLastName(ADMIN_LAST_NAME);
            admin.setEmail(ADMIN_EMAIL);
            admin.setCreatedAt(LocalDateTime.now());
            System.out.println("✅ Création du compte ADMIN...");
        }
        if (newAdmin || admin.getPasswordHash() == null || admin.getPasswordHash().isBlank()) {
            admin.setPasswordHash(passwordEncoder.encode(ADMIN_PASSWORD));
        }
        admin.setRole(Role.ADMIN);
        admin.setActive(true);
        admin.setRegistrationStatus(RegistrationStatus.CONFIRMEE);
        userRepository.save(admin);
        System.out.println("✅ Compte ADMIN prêt (admin@ftn.tn / admin123)");

        // ── COACH de test ────────────────────────────────────────
        User coach = userRepository.findByEmail("coach.test@ftn.tn").orElse(null);
        boolean newCoach = coach == null;
        if (newCoach) {
            coach = new User();
            coach.setFirstName("Moez");
            coach.setLastName("Gharbi");
            coach.setEmail("coach.test@ftn.tn");
            coach.setCreatedAt(LocalDateTime.now());
            coach.setAnciennete(5);
            System.out.println("✅ Création du compte COACH de test...");
        }
        if (newCoach || coach.getPasswordHash() == null || coach.getPasswordHash().isBlank()) {
            coach.setPasswordHash(passwordEncoder.encode("coach123"));
        }
        coach.setRole(Role.COACH);
        coach.setActive(true);
        coach.setRegistrationStatus(RegistrationStatus.CONFIRMEE);
        coach = userRepository.save(coach);
        System.out.println("✅ Compte COACH prêt (coach.test@ftn.tn / coach123)");

        // ── Club par défaut ────────────────────────────────────────
        tn.federation.backend.entities.Club club = null;
        for (tn.federation.backend.entities.Club c : clubRepository.findAll()) {
            club = c;
            break;
        }
        if (club == null) {
            club = new tn.federation.backend.entities.Club();
            club.setName("Club Sportif de Tunis");
            club.setRegion("Tunis");
            club.setAddress("Avenue Habib Bourguiba");
            club.setContact("71 000 000");
            club.setManager("Mohamed Ben Salah");
            club.setCoach(coach);
            club = clubRepository.save(club);
            System.out.println("✅ Club par défaut créé avec succès!");
        } else if (club.getCoach() == null) {
            club.setCoach(coach);
            club = clubRepository.save(club);
            System.out.println("✅ Club par défaut associé au COACH!");
        }

        // ── SWIMMER de test ────────────────────────────────────────
        User swimmer = userRepository.findByEmail(SWIMMER_EMAIL).orElse(null);
        boolean newSwimmer = swimmer == null;
        if (newSwimmer) {
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
        }
        if (newSwimmer || swimmer.getPasswordHash() == null || swimmer.getPasswordHash().isBlank()) {
            swimmer.setPasswordHash(passwordEncoder.encode(SWIMMER_PASSWORD));
        }
        swimmer.setRole(Role.SWIMMER);
        swimmer.setActive(true);
        swimmer.setRegistrationStatus(RegistrationStatus.CONFIRMEE);
        swimmer.setClub(club);
        userRepository.save(swimmer);
        System.out.println("✅ Compte SWIMMER prêt (nageur@ftn.tn / nageur123)");

        // ── NOUVEAU SWIMMER de test ────────────────────────────────────────
        User nouveauSwimmer = userRepository.findByEmail("nouveau.nageur@ftn.tn").orElse(null);
        if (nouveauSwimmer == null) {
            nouveauSwimmer = new User();
            nouveauSwimmer.setFirstName("Sami");
            nouveauSwimmer.setLastName("Trabelsi");
            nouveauSwimmer.setEmail("nouveau.nageur@ftn.tn");
            nouveauSwimmer.setCreatedAt(LocalDateTime.now());
            nouveauSwimmer.setBirthDate(LocalDate.of(2005, 8, 20));
            nouveauSwimmer.setGender(Gender.HOMME);
            nouveauSwimmer.setNiveau(Niveau.JUNIOR);
            nouveauSwimmer.setDiscipline(Discipline.NATATION);
            System.out.println("✅ Création du nouveau compte SWIMMER de test...");
        }
        nouveauSwimmer.setPasswordHash(passwordEncoder.encode("azerty123"));
        nouveauSwimmer.setRole(Role.SWIMMER);
        nouveauSwimmer.setActive(true);
        nouveauSwimmer.setClub(club);
        userRepository.save(nouveauSwimmer);
        System.out.println("✅ Nouveau Compte SWIMMER prêt (nouveau.nageur@ftn.tn / azerty123)");
    }
}
