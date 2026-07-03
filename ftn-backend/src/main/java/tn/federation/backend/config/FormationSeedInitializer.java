package tn.federation.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import tn.federation.backend.entities.*;
import tn.federation.backend.repositories.FormationProgramRepository;
import tn.federation.backend.repositories.SeasonRepository;
import tn.federation.backend.repositories.UserRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@Order(2)
public class FormationSeedInitializer implements CommandLineRunner {

    private static final String COACH_EMAIL = "coach@ftn.tn";
    private static final String COACH_PASSWORD = "coach123";

    private final SeasonRepository seasonRepository;
    private final FormationProgramRepository programRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public FormationSeedInitializer(
            SeasonRepository seasonRepository,
            FormationProgramRepository programRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.seasonRepository = seasonRepository;
        this.programRepository = programRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        User coach = ensureCoachUser();
        Season activeSeason = ensureActiveSeason();
        seedSwimmerPrograms(coach, activeSeason);
        seedCoachCertificationPrograms(activeSeason);
    }

    private User ensureCoachUser() {
        User coach = userRepository.findByEmail(COACH_EMAIL).orElse(null);
        if (coach == null) {
            coach = new User();
            coach.setFirstName("Karim");
            coach.setLastName("Mejri");
            coach.setEmail(COACH_EMAIL);
            coach.setCreatedAt(LocalDateTime.now());
            coach.setBirthDate(LocalDate.of(1988, 3, 12));
            coach.setGender(Gender.HOMME);
            coach.setAnciennete(8);
            System.out.println("✅ Création du compte COACH de test...");
        }
        coach.setPasswordHash(passwordEncoder.encode(COACH_PASSWORD));
        coach.setRole(Role.COACH);
        coach.setActive(true);
        coach.setRegistrationStatus(RegistrationStatus.CONFIRMEE);
        return userRepository.save(coach);
    }

    private Season ensureActiveSeason() {
        List<Season> actives = seasonRepository.findByActiveTrue();
        if (actives.size() > 1) {
            Season keep = actives.stream()
                    .max(java.util.Comparator.<Season>comparingInt(
                            s -> programRepository.findBySeason_IdOrderByCreatedAtDesc(s.getId()).size())
                            .thenComparing(Season::getCreatedAt))
                    .orElse(actives.get(0));
            for (Season season : actives) {
                if (!season.getId().equals(keep.getId())) {
                    season.setActive(false);
                    seasonRepository.save(season);
                }
            }
            System.out.println("✅ Saison active unique : " + keep.getLabel());
            return keep;
        }
        return actives.stream().findFirst().orElseGet(() -> {
                    Season archived = new Season();
                    archived.setLabel("2024-2025");
                    archived.setActive(false);
                    seasonRepository.save(archived);

                    Season season = new Season();
                    season.setLabel("2025-2026");
                    season.setActive(true);
                    Season saved = seasonRepository.save(season);
                    System.out.println("✅ Saisons de formation créées (2025-2026 active)");
                    return saved;
                });
    }

    private void seedSwimmerPrograms(User coach, Season season) {
        LocalDate today = LocalDate.now();
        seedSwimmerProgramIfMissing(season, coach, TargetCategory.BENJAMINS, today);
        seedSwimmerProgramIfMissing(season, coach, TargetCategory.MINIMES, today);
        seedSwimmerProgramIfMissing(season, coach, TargetCategory.SENIORS, today);
    }

    private void seedSwimmerProgramIfMissing(Season season, User coach, TargetCategory category, LocalDate today) {
        boolean exists = programRepository.findByProgramTypeAndSeason_IdOrderByCreatedAtDesc(
                ProgramType.SWIMMER_TRAINING, season.getId()
        ).stream().anyMatch(p -> category.equals(p.getTargetCategory()));
        if (exists) {
            return;
        }
        switch (category) {
            case BENJAMINS -> createSwimmerProgram(season, coach, category,
                    "Programme natation Benjamins",
                    "Nageurs nés en 2014-2015. Maîtrise des 4 nages et préparation aux compétitions départementales.",
                    "Piscine Olympique de Radès", 24, new BigDecimal("15.00"), today);
            case MINIMES -> createSwimmerProgram(season, coach, category,
                    "Programme natation Minimes",
                    "Nageurs nés en 2012-2013. Renforcement technique, endurance et préparation aux championnats régionaux.",
                    "Complexe sportif El Menzah", 20, new BigDecimal("18.00"), today);
            case SENIORS -> createSwimmerProgram(season, coach, category,
                    "Programme natation Seniors",
                    "Nageurs 18 ans et plus. Perfectionnement technique, préparation physique et objectifs chronos.",
                    "Centre aquatique La Marsa", 16, new BigDecimal("22.00"), today);
            default -> { }
        }
        System.out.println("✅ Programme nageur créé : " + category);
    }

    private void createSwimmerProgram(
            Season season,
            User coach,
            TargetCategory category,
            String title,
            String conditions,
            String location,
            int maxParticipants,
            BigDecimal pricePerSession,
            LocalDate today) {
        FormationProgram program = new FormationProgram();
        program.setTitle(title);
        program.setProgramType(ProgramType.SWIMMER_TRAINING);
        program.setTargetCategory(category);
        program.setCoach(coach);
        program.setSeason(season);
        program.setStatus(FormationProgramStatus.PUBLISHED);
        program.setLocation(location);
        program.setMaxParticipants(maxParticipants);
        program.setPricePerSession(pricePerSession);
        program.setRegistrationStartDate(today.minusDays(14));
        program.setRegistrationEndDate(today.plusMonths(2));
        program.setRegistrationConditions(conditions);
        program.setRegistrationLocation(location);
        program.setTheoreticalStartDate(today.plusMonths(1));
        program.setTheoreticalEndDate(today.plusMonths(2));
        program.setTheoreticalLocation(location);
        program.setPracticalPeriodStart(today.plusMonths(2).plusDays(7));
        program.setPracticalPeriodEnd(today.plusMonths(4));
        program.setPracticalDescription("Séances pratiques encadrées par le coach " + coach.getFirstName() + " " + coach.getLastName());
        programRepository.save(program);
    }

    private void seedCoachCertificationPrograms(Season season) {
        List<FormationProgram> existing = programRepository
                .findByProgramTypeAndSeason_IdOrderByCreatedAtDesc(ProgramType.COACH_CERTIFICATION, season.getId());
        if (!existing.isEmpty()) {
            return;
        }

        LocalDate today = LocalDate.now();
        createCoachProgram(season, BrevetType.BF1, "Formation BF1 — Brevet Fédéral 1",
                "Être nageur confirmé ou avoir une expérience d'entraînement. Licence FTN en cours de validité.",
                today);
        createCoachProgram(season, BrevetType.BF2, "Formation BF2 — Brevet Fédéral 2",
                "Avoir validé le BF1 ou justifier d'une expérience d'encadrement de 2 ans minimum.",
                today);
        System.out.println("✅ Formations coach BF1/BF2 créées");
    }

    private void createCoachProgram(Season season, BrevetType brevet, String title, String conditions, LocalDate today) {
        FormationProgram program = new FormationProgram();
        program.setTitle(title);
        program.setProgramType(ProgramType.COACH_CERTIFICATION);
        program.setBrevetType(brevet);
        program.setSeason(season);
        program.setStatus(FormationProgramStatus.PUBLISHED);
        program.setRegistrationStartDate(today.minusDays(14));
        program.setRegistrationEndDate(today.plusMonths(2));
        program.setRegistrationConditions(conditions);
        program.setRegistrationLocation("Siège FTN — Tunis");
        program.setRegistrationFee(new BigDecimal("120.00"));
        program.setTheoreticalStartDate(today.plusMonths(1));
        program.setTheoreticalEndDate(today.plusMonths(2));
        program.setTheoreticalLocation("Institut FTN — Tunis");
        program.setPracticalPeriodStart(today.plusMonths(2).plusDays(14));
        program.setPracticalPeriodEnd(today.plusMonths(4));
        program.setInstituteAddress("Avenue Mohamed V, Tunis");
        program.setInstituteEmail("formation@ftn.tn");
        program.setInstitutePhone("71123456");
        programRepository.save(program);
    }
}
