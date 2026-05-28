package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.federation.backend.entities.PressPin;
import java.util.List;
import java.util.Optional;

@Repository
public interface PressPinRepository extends JpaRepository<PressPin, Long> {
    @Query("SELECT p FROM PressPin p WHERE p.pressItem.idPressItem = :pressItemId")
    List<PressPin> findByPressItemId(@Param("pressItemId") Long pressItemId);

    @Query("SELECT p FROM PressPin p WHERE p.pressItem.idPressItem = :pressItemId AND p.user.id = :userId")
    Optional<PressPin> findByPressItemIdAndUserId(@Param("pressItemId") Long pressItemId, @Param("userId") Long userId);

    long countByUserId(Long userId);
}
