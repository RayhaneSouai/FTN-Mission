package tn.federation.backend.repositories.press;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import tn.federation.backend.entities.press.PressItem;
import tn.federation.backend.entities.press.PressType;
import tn.federation.backend.entities.press.PressStatus;
import java.util.List;

@Repository
public interface IPressItemRepository extends JpaRepository<PressItem, Long> {
    List<PressItem> findByType(PressType type);
    List<PressItem> findByTypeAndStatus(PressType type, PressStatus status);
    List<PressItem> findByTypeAndDiscipline(PressType type, String discipline);
    List<PressItem> findByTypeAndStatusOrderByPublishedAtDesc(PressType type, PressStatus status);
    long countByStatus(PressStatus status);
    long countByType(PressType type);
    @Query("SELECT p.discipline, COUNT(p) FROM PressItem p GROUP BY p.discipline")
    List<Object[]> countByDiscipline();

    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true)
    @org.springframework.transaction.annotation.Transactional
    @Query(value = "UPDATE press_item SET status = ?2 WHERE id_press_item = ?1", nativeQuery = true)
    void updateStatus(long id, String status);

    @org.springframework.data.jpa.repository.Modifying(clearAutomatically = true)
    @org.springframework.transaction.annotation.Transactional
    @Query(value = "UPDATE press_item SET status = 'PUBLISHED', published_at = CURRENT_TIMESTAMP WHERE id_press_item = ?1", nativeQuery = true)
    void publishItem(long id);
}
