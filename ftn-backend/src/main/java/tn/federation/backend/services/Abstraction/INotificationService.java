package tn.federation.backend.services.Abstraction;

import tn.federation.backend.dto.AppNotificationDTO;
import tn.federation.backend.entities.Club;
import tn.federation.backend.entities.User;
import tn.federation.backend.entities.License;

import java.util.List;

public interface INotificationService {
    void reportClubAdminError(User coach, Long clubId, String season, List<String> fields, String description);

    int requestSeasonValidationForAllCoaches(String season);

    List<AppNotificationDTO> getAdminNotifications();

    long countUnreadAdminNotifications();

    void markAsRead(Long notificationId);

    void markAllAdminNotificationsAsRead();

    void notifyCoachOfPendingLicense(License license);

    void notifyAdminOfSeasonValidationDecision(User coach, Club club, String season, boolean approved);

    void notifyAdminOfIndependentSwimmerValidationDecision(User swimmer, String season, boolean approved);

    List<AppNotificationDTO> getNotificationsForUser(User user);

    long countUnreadNotificationsForUser(User user);
}
