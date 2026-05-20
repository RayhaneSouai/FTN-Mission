package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.federation.backend.entities.PressFavorite;
import java.util.List;
import java.util.Optional;

@Repository
public interface PressFavoriteRepository extends JpaRepository<PressFavorite, Long> {
    @Query("SELECT f FROM PressFavorite f WHERE f.pressItem.idPressItem = :pressItemId")
    List<PressFavorite> findByPressItemId(@Param("pressItemId") Long pressItemId);

    @Query("SELECT f FROM PressFavorite f WHERE f.pressItem.idPressItem = :pressItemId AND f.user.id = :userId")
    Optional<PressFavorite> findByPressItemIdAndUserId(@Param("pressItemId") Long pressItemId, @Param("userId") Long userId);

    long countByUserId(Long userId);
}
