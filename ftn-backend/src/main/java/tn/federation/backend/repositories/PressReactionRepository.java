package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.federation.backend.entities.PressReaction;
import java.util.List;
import java.util.Optional;

@Repository
public interface PressReactionRepository extends JpaRepository<PressReaction, Long> {
    @Query("SELECT r FROM PressReaction r WHERE r.pressItem.idPressItem = :pressItemId")
    List<PressReaction> findByPressItemId(@Param("pressItemId") Long pressItemId);

    @Query("SELECT r FROM PressReaction r WHERE r.pressItem.idPressItem = :pressItemId AND r.user.id = :userId")
    Optional<PressReaction> findByPressItemIdAndUserId(@Param("pressItemId") Long pressItemId, @Param("userId") Long userId);
}
