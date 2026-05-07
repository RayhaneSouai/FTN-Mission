package tn.federation.backend.repositories.press;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import tn.federation.backend.entities.press.PressItem;
import tn.federation.backend.entities.press.PressType;
import tn.federation.backend.entities.press.PressStatus;
import java.util.List;

@Repository
public interface IPressItemRepository extends CrudRepository<PressItem, Long> {
    List<PressItem> findByType(PressType type);
    List<PressItem> findByTypeAndStatus(PressType type, PressStatus status);
    List<PressItem> findByTypeAndDiscipline(PressType type, String discipline);
    List<PressItem> findByParentPressItem_IdPressItem(Long parentId);
    List<PressItem> findByTypeAndStatusOrderByPublishedAtDesc(PressType type, PressStatus status);
}
