package tn.federation.backend.dto;

import lombok.Getter;
import lombok.Setter;
import tn.federation.backend.entities.AppNotification;
import tn.federation.backend.entities.NotificationType;

import java.time.LocalDateTime;

@Getter
@Setter
public class AppNotificationDTO {
    private Long id;
    private NotificationType type;
    private String title;
    private String message;
    private Long clubId;
    private String clubName;
    private String season;
    private String createdByName;
    private String payload;
    private Long licenseId;
    private boolean read;
    private LocalDateTime createdAt;

    public static AppNotificationDTO fromEntity(AppNotification n) {
        AppNotificationDTO dto = new AppNotificationDTO();
        dto.setId(n.getId());
        dto.setType(n.getType());
        dto.setTitle(n.getTitle());
        dto.setMessage(n.getMessage());
        dto.setClubId(n.getClubId());
        dto.setClubName(n.getClubName());
        dto.setSeason(n.getSeason());
        dto.setCreatedByName(n.getCreatedByName());
        dto.setPayload(n.getPayload());
        dto.setLicenseId(n.getLicenseId());
        dto.setRead(n.isRead());
        dto.setCreatedAt(n.getCreatedAt());
        return dto;
    }
}
