package tn.federation.backend.services.press.Abstraction;

import tn.federation.backend.entities.press.PressItem;
import tn.federation.backend.entities.press.PressType;
import java.util.List;

public interface IPressService {
    List<PressItem> getAll();
    PressItem getPressItemById(long id);
    PressItem add(PressItem pressItem);
    PressItem update(long id, PressItem pressItem);
    void deletePressItem(long id);
    PressItem publish(long id);
    PressItem archive(long id);
    List<PressItem> getByType(PressType type);
    List<PressItem> getByTypeAndDiscipline(PressType type, String discipline);
    List<PressItem> getMediaByParent(long parentId);
}
