package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.federation.backend.entities.AppNotification;
import tn.federation.backend.entities.NotificationType;
import tn.federation.backend.entities.Role;

import java.util.List;

@Repository
public interface AppNotificationRepository extends JpaRepository<AppNotification, Long> {
    List<AppNotification> findByTargetRoleAndReadFalseOrderByCreatedAtDesc(Role targetRole);

    List<AppNotification> findByTargetRoleOrderByCreatedAtDesc(Role targetRole);

    long countByTargetRoleAndReadFalse(Role targetRole);

    List<AppNotification> findByTargetRoleAndTypeAndReadFalseOrderByCreatedAtDesc(
            Role targetRole, NotificationType type);

    List<AppNotification> findByTargetUserIdOrderByCreatedAtDesc(Long targetUserId);

    void deleteByLicenseId(Long licenseId);

    long countByTargetUserIdAndReadFalse(Long targetUserId);
}
