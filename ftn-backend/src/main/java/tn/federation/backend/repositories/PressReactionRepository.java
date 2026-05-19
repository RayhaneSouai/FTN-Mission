package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.federation.backend.entities.PressReaction;
import java.util.List;
import java.util.Optional;

@Repository
public interface PressReactionRepository extends JpaRepository<PressReaction, Long> {
    List<PressReaction> findByPressItemId(Long pressItemId);
    Optional<PressReaction> findByPressItemIdAndUserId(Long pressItemId, Long userId);
}
