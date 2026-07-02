package tn.federation.backend.services.ServiceImpl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tn.federation.backend.dto.AppNotificationDTO;
import tn.federation.backend.entities.*;
import tn.federation.backend.repositories.AppNotificationRepository;
import tn.federation.backend.repositories.ClubRepository;
import tn.federation.backend.repositories.ClubSeasonValidationRepository;
import tn.federation.backend.repositories.UserRepository;
import tn.federation.backend.services.Abstraction.IEmailService;
import tn.federation.backend.services.Abstraction.INotificationService;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements INotificationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(NotificationServiceImpl.class);
    private static final Map<String, String> FIELD_LABELS = Map.of(
            "manager", "Responsable / Manager",
            "contact", "Contact téléphonique",
            "address", "Adresse postale",
            "region", "Gouvernorat / Région",
            "affiliationDate", "Date d'affiliation"
    );

    private final AppNotificationRepository notificationRepository;
    private final ClubRepository clubRepository;
    private final ClubSeasonValidationRepository clubSeasonValidationRepository;
    private final UserRepository userRepository;
    private final IEmailService emailService;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    public NotificationServiceImpl(
            AppNotificationRepository notificationRepository,
            ClubRepository clubRepository,
            ClubSeasonValidationRepository clubSeasonValidationRepository,
            UserRepository userRepository,
            IEmailService emailService,
            org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.clubRepository = clubRepository;
        this.clubSeasonValidationRepository = clubSeasonValidationRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    @Transactional
    public void reportClubAdminError(User coach, Long clubId, String season, List<String> fields, String description) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new IllegalArgumentException("Club introuvable"));

        List<Club> coachClubs = clubRepository.findByCoachId(coach.getId());
        boolean assigned = coachClubs.stream().anyMatch(c -> c.getId().equals(clubId));
        if (!assigned) {
            throw new IllegalArgumentException("Ce club ne vous est pas assigné.");
        }

        List<String> safeFields = fields == null ? List.of() : fields.stream()
                .filter(f -> f != null && !f.isBlank())
                .toList();
        if (safeFields.isEmpty()) {
            throw new IllegalArgumentException("Sélectionnez au moins un champ erroné.");
        }

        String coachName = coach.getFirstName() + " " + coach.getLastName();
        String fieldLabels = safeFields.stream()
                .map(f -> FIELD_LABELS.getOrDefault(f, f))
                .collect(Collectors.joining(", "));

        String message = "Le coach " + coachName + " signale des erreurs sur la fiche administrative du club "
                + club.getName() + " (saison " + season + "). Champs concernés : " + fieldLabels + ".";

        AppNotification notification = new AppNotification();
        notification.setType(NotificationType.CLUB_ADMIN_ERROR);
        notification.setTitle("Signalement fiche club — " + club.getName());
        notification.setMessage(message);
        notification.setTargetRole(Role.ADMIN);
        notification.setClubId(club.getId());
        notification.setClubName(club.getName());
        notification.setSeason(season);
        notification.setCreatedByUserId(coach.getId());
        notification.setCreatedByName(coachName.trim());
        notification.setPayload(buildPayload(safeFields, description));
        saveAndBroadcast(notification);

        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            try {
                emailService.sendClubAdminErrorReportToAdmin(
                        admin.getEmail(),
                        coachName.trim(),
                        coach.getEmail(),
                        club.getName(),
                        season,
                        fieldLabels,
                        description == null ? "" : description.trim()
                );
            } catch (RuntimeException ex) {
                LOGGER.warn("Email signalement club non envoyé à {} : {}", admin.getEmail(), ex.getMessage());
            }
        }
    }

    @Override
    @Transactional
    public int requestSeasonValidationForAllCoaches(String season) {
        if (season == null || season.isBlank()) {
            throw new IllegalArgumentException("La saison est obligatoire.");
        }

        List<Club> clubs = (List<Club>) clubRepository.findAll();
        int notified = 0;

        for (Club club : clubs) {
            User coach = club.getCoach();
            if (coach == null || coach.getEmail() == null || coach.getEmail().isBlank()) {
                continue;
            }

            boolean alreadyValidated = clubSeasonValidationRepository
                    .existsByClubIdAndSeasonAndIsValidatedTrue(club.getId(), season);
            if (alreadyValidated) {
                continue;
            }

            notifyCoachForSeasonValidation(coach, club, season);
            notified++;
        }

        // Notify independent swimmers (Role.SWIMMER and club == null)
        List<User> independentSwimmers = userRepository.findByRole(Role.SWIMMER).stream()
                .filter(u -> u.getClub() == null)
                .toList();

        for (User swimmer : independentSwimmers) {
            notifyIndependentSwimmerForSeasonValidation(swimmer, season);
            notified++;
        }

        return notified;
    }

    private void notifyIndependentSwimmerForSeasonValidation(User swimmer, String season) {
        String swimmerName = (swimmer.getFirstName() + " " + swimmer.getLastName()).trim();
        String normalizedSeason = season.replace('/', '-').trim();

        AppNotification notification = new AppNotification();
        notification.setType(NotificationType.SEASON_VALIDATION_REQUEST);
        notification.setTitle("Validation de saison requise (Indépendant)");
        notification.setMessage("Veuillez valider la saison " + normalizedSeason + " afin de renouveler votre licence individuelle.");
        notification.setTargetRole(Role.SWIMMER);
        notification.setTargetUserId(swimmer.getId());
        notification.setSeason(normalizedSeason);
        notification.setRead(false);
        saveAndBroadcast(notification);

        try {
            emailService.sendSwimmerSeasonValidationRequest(
                    swimmer.getEmail(),
                    swimmerName,
                    normalizedSeason
            );
        } catch (RuntimeException ex) {
            LOGGER.warn("Email validation saison non envoyé au nageur {} : {}", swimmer.getEmail(), ex.getMessage());
        }
    }

    private void notifyCoachForSeasonValidation(User coach, Club club, String season) {
        String coachName = (coach.getFirstName() + " " + coach.getLastName()).trim();

        AppNotification notification = new AppNotification();
        notification.setType(NotificationType.SEASON_VALIDATION_REQUEST);
        notification.setTitle("Validation de saison requise");
        notification.setMessage("Veuillez valider la saison " + season + " pour le club " + club.getName()
                + " afin d'activer les licences de vos nageurs.");
        notification.setTargetRole(Role.COACH);
        notification.setTargetUserId(coach.getId());
        notification.setClubId(club.getId());
        notification.setClubName(club.getName());
        notification.setSeason(season);
        notification.setRead(false);
        saveAndBroadcast(notification);

        try {
            emailService.sendSeasonValidationRequestToCoach(
                    coach.getEmail(),
                    coachName,
                    club.getName(),
                    season
            );
        } catch (RuntimeException ex) {
            LOGGER.warn("Email validation saison non envoyé à {} : {}", coach.getEmail(), ex.getMessage());
        }
    }

    @Override
    public List<AppNotificationDTO> getAdminNotifications() {
        return notificationRepository.findByTargetRoleOrderByCreatedAtDesc(Role.ADMIN)
                .stream()
                .map(AppNotificationDTO::fromEntity)
                .toList();
    }

    @Override
    public long countUnreadAdminNotifications() {
        return notificationRepository.countByTargetRoleAndReadFalse(Role.ADMIN);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId) {
        AppNotification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification introuvable"));
        if (!notification.isRead()) {
            notification.setRead(true);
            notification.setReadAt(java.time.LocalDateTime.now());
            saveAndBroadcast(notification);
        }
    }

    @Override
    @Transactional
    public void markAllAdminNotificationsAsRead() {
        List<AppNotification> unread = notificationRepository
                .findByTargetRoleAndReadFalseOrderByCreatedAtDesc(Role.ADMIN);
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        for (AppNotification n : unread) {
            n.setRead(true);
            n.setReadAt(now);
        }
        notificationRepository.saveAll(unread);
    }

    @Override
    @Transactional
    public void notifyCoachOfPendingLicense(License license) {
        if (license == null || license.getClub() == null) return;
        Club club = license.getClub();
        User coach = club.getCoach();
        if (coach == null || coach.getEmail() == null || coach.getEmail().isBlank()) {
            return;
        }

        String coachName = (coach.getFirstName() + " " + coach.getLastName()).trim();
        String licenseNumber = license.getLicenseNumber();
        String season = license.getSeason().replace('/', '-').trim();

        AppNotification notification = new AppNotification();
        notification.setType(NotificationType.SEASON_VALIDATION_REQUEST);
        notification.setTitle("Validation de licence en attente");
        notification.setMessage("Une nouvelle licence (" + licenseNumber + ") pour le club " + club.getName()
                + " est en attente de validation pour la saison " + season + ".");
        notification.setTargetRole(Role.COACH);
        notification.setTargetUserId(coach.getId());
        notification.setClubId(club.getId());
        notification.setClubName(club.getName());
        notification.setSeason(season);
        notification.setLicenseId(license.getId());
        notification.setRead(false);
        saveAndBroadcast(notification);

        try {
            emailService.sendLicensePendingValidationToCoach(
                    coach.getEmail(),
                    coachName,
                    club.getName(),
                    season,
                    licenseNumber
            );
        } catch (RuntimeException ex) {
            LOGGER.warn("Email validation licence non envoyé à {} : {}", coach.getEmail(), ex.getMessage());
        }
    }

    @Override
    @Transactional
    public void notifySwimmerOfPendingLicense(License license) {
        if (license == null || license.getSwimmer() == null) return;
        User swimmer = license.getSwimmer();
        
        String swimmerName = (swimmer.getFirstName() + " " + swimmer.getLastName()).trim();
        String licenseNumber = license.getLicenseNumber();
        String season = license.getSeason().replace('/', '-').trim();

        AppNotification notification = new AppNotification();
        notification.setType(NotificationType.LICENSE_VALIDATION_REQUEST);
        notification.setTitle("Validation de licence en attente");
        notification.setMessage("Votre licence individuelle (" + licenseNumber + ") "
                + "est en attente de validation pour la saison " + season + ".");
        notification.setTargetRole(Role.SWIMMER);
        notification.setTargetUserId(swimmer.getId());
        notification.setSeason(season);
        notification.setLicenseId(license.getId());
        notification.setRead(false);
        saveAndBroadcast(notification);

        try {
            // Note: IEmailService needs a method for this, I'll use sendSwimmerSeasonValidationRequest for now, or I'll just use a generic one if it existed.
            emailService.sendSwimmerSeasonValidationRequest(
                    swimmer.getEmail(),
                    swimmerName,
                    season
            );
        } catch (RuntimeException ex) {
            LOGGER.warn("Email validation licence non envoyé au nageur {} : {}", swimmer.getEmail(), ex.getMessage());
        }
    }

    @Override
    @Transactional
    public void deleteNotificationsByLicenseId(Long licenseId) {
        if (licenseId != null) {
            notificationRepository.deleteByLicenseId(licenseId);
        }
    }

    @Override
    @Transactional
    public void notifyAdminOfSeasonValidationDecision(User coach, Club club, String season, boolean approved) {
        String coachName = (coach.getFirstName() + " " + coach.getLastName()).trim();
        String normalizedSeason = season.replace('/', '-').trim();
        String status = approved ? "VALIDATED" : "REFUSED";
        String statusLabel = approved ? "acceptée" : "refusée";

        AppNotification notification = new AppNotification();
        notification.setType(NotificationType.SEASON_VALIDATION_REQUEST);
        notification.setTitle("Décision validation de saison — " + club.getName());
        notification.setMessage("Le coach " + coachName + " a " + statusLabel + " la validation de la saison " 
                + normalizedSeason + " pour le club " + club.getName() + ". Le statut final des licences est " + status + ".");
        notification.setTargetRole(Role.ADMIN);
        notification.setClubId(club.getId());
        notification.setClubName(club.getName());
        notification.setSeason(normalizedSeason);
        notification.setRead(false);
        saveAndBroadcast(notification);

        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            try {
                emailService.sendSeasonValidationDecisionToAdmin(
                        admin.getEmail(),
                        coachName,
                        club.getName(),
                        normalizedSeason,
                        approved
                );
            } catch (RuntimeException ex) {
                LOGGER.warn("Email décision validation saison non envoyé à {} : {}", admin.getEmail(), ex.getMessage());
            }
        }
    }

    @Override
    @Transactional
    public void notifyAdminOfIndependentSwimmerValidationDecision(User swimmer, String season, boolean approved) {
        String swimmerName = (swimmer.getFirstName() + " " + swimmer.getLastName()).trim();
        String normalizedSeason = season.replace('/', '-').trim();
        String statusLabel = approved ? "validé" : "refusé";

        AppNotification notification = new AppNotification();
        notification.setType(NotificationType.SEASON_VALIDATION_REQUEST);
        notification.setTitle("Décision validation licence individuelle");
        notification.setMessage("Le nageur indépendant " + swimmerName + " a " + statusLabel
                + " le renouvellement de sa licence pour la saison " + normalizedSeason + ".");
        notification.setTargetRole(Role.ADMIN);
        notification.setSeason(normalizedSeason);
        notification.setRead(false);
        saveAndBroadcast(notification);

        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            try {
                emailService.sendSeasonValidationDecisionToAdmin(
                        admin.getEmail(),
                        swimmerName,
                        "Nageur Indépendant",
                        normalizedSeason,
                        approved
                );
            } catch (RuntimeException ex) {
                LOGGER.warn("Email décision validation nageur indépendant non envoyé à {} : {}", admin.getEmail(), ex.getMessage());
            }
        }
    }

    @Override
    public List<AppNotificationDTO> getNotificationsForUser(User user) {
        if (user.getRole() == Role.ADMIN) {
            return getAdminNotifications();
        } else if (user.getRole() == Role.COACH || user.getRole() == Role.SWIMMER) {
            return notificationRepository.findByTargetUserIdOrderByCreatedAtDesc(user.getId())
                    .stream()
                    .map(AppNotificationDTO::fromEntity)
                    .toList();
        }
        return List.of();
    }

    @Override
    public long countUnreadNotificationsForUser(User user) {
        if (user.getRole() == Role.ADMIN) {
            return countUnreadAdminNotifications();
        } else if (user.getRole() == Role.COACH || user.getRole() == Role.SWIMMER) {
            return notificationRepository.countByTargetUserIdAndReadFalse(user.getId());
        }
        return 0L;
    }

    private String buildPayload(List<String> fields, String description) {
        String fieldsPart = String.join(",", fields);
        String desc = description == null ? "" : description.replace("|", " ").replace("\n", " ");
        return "fields=" + fieldsPart + "|description=" + desc;
    }

    private void saveAndBroadcast(AppNotification notification) {
        AppNotification saved = notificationRepository.save(notification);
        AppNotificationDTO dto = AppNotificationDTO.fromEntity(saved);
        if (notification.getTargetUserId() != null) {
            messagingTemplate.convertAndSend("/topic/notifications/" + notification.getTargetUserId(), dto);
        } else if (notification.getTargetRole() != null) {
            messagingTemplate.convertAndSend("/topic/notifications/role/" + notification.getTargetRole().name(), dto);
        }
    }
}
