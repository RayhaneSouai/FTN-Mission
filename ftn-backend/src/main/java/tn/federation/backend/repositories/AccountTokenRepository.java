package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.federation.backend.entities.AccountToken;
import tn.federation.backend.entities.TokenPurpose;

import java.time.Instant;
import java.util.Optional;

public interface AccountTokenRepository extends JpaRepository<AccountToken, Long> {
    Optional<AccountToken> findByTokenAndUsedAtIsNull(String token);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE AccountToken t SET t.usedAt = :usedAt WHERE t.email = :email AND t.purpose = :purpose AND t.usedAt IS NULL")
    void invalidateActiveTokens(@Param("email") String email,
                                @Param("purpose") TokenPurpose purpose,
                                @Param("usedAt") Instant usedAt);

    @Modifying
    @Query("DELETE FROM AccountToken t WHERE t.expiresAt < :before OR t.usedAt < :usedBefore")
    void deleteExpiredOrOldUsed(@Param("before") Instant before, @Param("usedBefore") Instant usedBefore);
}
