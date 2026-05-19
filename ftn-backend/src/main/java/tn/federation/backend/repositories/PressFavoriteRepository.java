package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.federation.backend.entities.PressFavorite;
import java.util.List;
import java.util.Optional;

@Repository
public interface PressFavoriteRepository extends JpaRepository<PressFavorite, Long> {
    List<PressFavorite> findByPressItemId(Long pressItemId);
    Optional<PressFavorite> findByPressItemIdAndUserId(Long pressItemId, Long userId);
}
