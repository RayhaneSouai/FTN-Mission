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
import tn.federation.backend.repositories.IPressItemRepository;
import tn.federation.backend.repositories.ClubRepository;
import tn.federation.backend.entities.PressItem;
import tn.federation.backend.entities.PressStatus;
import tn.federation.backend.entities.PressType;
import tn.federation.backend.entities.Performance;
import tn.federation.backend.entities.StrokeType;
import tn.federation.backend.repositories.PerformanceRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ClubRepository clubRepository;
    private final IPressItemRepository pressItemRepository;
    private final PerformanceRepository performanceRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String ADMIN_EMAIL = "admin@ftn.tn";
    private static final String ADMIN_PASSWORD = "admin123";
    private static final String ADMIN_FIRST_NAME = "Admin";
    private static final String ADMIN_LAST_NAME = "FTN";

    private static final String SWIMMER_EMAIL = "nageur@ftn.tn";
    private static final String SWIMMER_PASSWORD = "nageur123";

    public DataInitializer(
            UserRepository userRepository,
            ClubRepository clubRepository,
            IPressItemRepository pressItemRepository,
            PerformanceRepository performanceRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.clubRepository = clubRepository;
        this.pressItemRepository = pressItemRepository;
        this.performanceRepository = performanceRepository;
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

        // FORCE RESET du mot de passe pour les tests
        swimmer.setPasswordHash(passwordEncoder.encode(SWIMMER_PASSWORD));

        swimmer.setRole(Role.SWIMMER);
        swimmer.setActive(true);
        swimmer.setRegistrationStatus(RegistrationStatus.CONFIRMEE);
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
        nouveauSwimmer.setClub(null);
        userRepository.save(nouveauSwimmer);
        System.out.println("✅ Nouveau Compte SWIMMER prêt (nouveau.nageur@ftn.tn / azerty123)");

        initializePerformanceData();

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

        // ── Articles & Vidéos par défaut ────────────────────────────────
        if (pressItemRepository.count() == 0) {
            System.out.println("✅ Initialisation des articles de presse par défaut...");

            PressItem item1 = new PressItem();
            item1.setTitle(
                    "Nos Dernières Informations sur fédération tunisienne de natation - Webdo.tn - L'Info Sans Détour.");
            item1.setContent(
                    "Le Bureau directeur de la Fédération tunisienne de natation a annoncé sa démission dans un communiqué publié vendredi soir. La.");
            item1.setMediaUrl("https://www.webdo.tn/fr/wp-content/uploads/2026/04/Natation.jpg");
            item1.setLinkUrl("https://www.webdo.tn/fr/actualite/federation-tunisienne-de-natation/");
            item1.setDiscipline("Général");
            item1.setType(PressType.ARTICLE);
            item1.setStatus(PressStatus.PUBLISHED);
            item1.setViews(10L);
            item1.setPublishedAt(LocalDateTime.of(2026, 5, 22, 10, 53, 38));
            item1.setCreatedAt(LocalDateTime.of(2026, 5, 15, 14, 30, 53));
            pressItemRepository.save(item1);

            PressItem item2 = new PressItem();
            item2.setTitle("Natation : Hafnaoui en or, Jaouadi en argent... la Tunisie frappe fort aux NCAA - webdo");
            item2.setContent(
                    "La natation tunisienne a brillé aux États-Unis. Lors de la dernière journée des championnats universitaires américains (NCAA), Ayoub Hafnaoui et");
            item2.setMediaUrl("https://www.youtube.com/watch?v=FCVah2QUlKg");
            item2.setLinkUrl(
                    "https://www.webdo.tn/fr/actualite/sport/natation-hafnaoui-en-or-jaouadi-en-argent-la-tunisie-frappe-fort-aux-ncaa/395327/#google_vignette");
            item2.setDiscipline("Plongeon");
            item2.setType(PressType.VIDEO);
            item2.setStatus(PressStatus.PUBLISHED);
            item2.setViews(27L);
            item2.setPublishedAt(LocalDateTime.of(2026, 5, 22, 10, 54, 43));
            item2.setCreatedAt(LocalDateTime.of(2026, 5, 19, 21, 24, 48));
            pressItemRepository.save(item2);

            PressItem item3 = new PressItem();
            item3.setTitle("Ahmed Jaouadi: Double World Champion \uD83C\uDFC6\uD83C\uDFC6 - YouTube");
            item3.setContent(
                    "Two titles. One statement.Ahmed Jaouadi delivered a historic performance to become a double world champion, showcasing strength, composure, and world-class r...");
            item3.setMediaUrl("https://www.youtube.com/watch?v=RekjMo426is");
            item3.setLinkUrl("https://www.youtube.com/watch?v=RekjMo426is");
            item3.setDiscipline("Général");
            item3.setType(PressType.VIDEO);
            item3.setStatus(PressStatus.PUBLISHED);
            item3.setViews(2L);
            item3.setPublishedAt(LocalDateTime.of(2026, 6, 8, 21, 0, 8));
            item3.setCreatedAt(LocalDateTime.of(2026, 6, 8, 19, 59, 33));
            pressItemRepository.save(item3);

            PressItem item4 = new PressItem();
            item4.setTitle(
                    "Natation - South Sectional Championship : Hafnaoui domine les 400m et 1500m NL - Tunisie Numerique");
            item4.setContent("Natation - South Sectional Championship : Hafnaoui domine les 400m et 1500m NL");
            item4.setMediaUrl("https://www.tunisienumerique.com/wp-content/uploads/2026/06/HafnaouiTN46-1000x600.jpg");
            item4.setLinkUrl(
                    "https://www.tunisienumerique.com/natation-south-sectional-championship-hafnaoui-domine-les-400m-et-1500m-nl/");
            item4.setDiscipline("Général");
            item4.setType(PressType.ARTICLE);
            item4.setStatus(PressStatus.PUBLISHED);
            item4.setViews(2L);
            item4.setPublishedAt(LocalDateTime.of(2026, 6, 8, 22, 10, 42));
            item4.setCreatedAt(LocalDateTime.of(2026, 6, 8, 21, 10, 9));
            pressItemRepository.save(item4);

            System.out.println("✅ Articles de presse insérés avec succès!");
        }
    }

    private void initializePerformanceData() {
        List<User> swimmers = userRepository.findByRole(Role.SWIMMER);
        for (User swimmer : swimmers) {
            if (performanceRepository.countBySwimmerId(swimmer.getId()) > 0) {
                continue;
            }

            double offset = (swimmer.getId() % 5) * 0.37;
            createPerformance(swimmer, 50, StrokeType.LIBRE, 25.92 + offset, LocalDate.of(2026, 3, 12), true);
            createPerformance(swimmer, 100, StrokeType.LIBRE, 56.34 + offset, LocalDate.of(2026, 4, 7), true);
            createPerformance(swimmer, 200, StrokeType.LIBRE, 124.87 + offset, LocalDate.of(2026, 4, 21), true);
            createPerformance(swimmer, 100, StrokeType.DOS, 64.18 + offset, LocalDate.of(2026, 5, 3), true);
            createPerformance(swimmer, 100, StrokeType.BRASSE, 71.42 + offset, LocalDate.of(2026, 5, 18), true);
            createPerformance(swimmer, 50, StrokeType.PAPILLON, 27.48 + offset, LocalDate.of(2026, 6, 2), true);
            System.out.println("✅ Performances de démonstration créées pour " + swimmer.getEmail());
        }
    }

    private void createPerformance(User swimmer, Integer distance, StrokeType stroke, Double time, LocalDate date, boolean personalRecord) {
        Performance performance = new Performance();
        performance.setSwimmer(swimmer);
        performance.setDistance(distance);
        performance.setStroke(stroke);
        performance.setTime(time);
        performance.setDate(date);
        performance.setIsPersonalRecord(personalRecord);
        performanceRepository.save(performance);
    }
}
