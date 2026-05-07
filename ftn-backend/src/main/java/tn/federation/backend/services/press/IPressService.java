package tn.federation.backend.services.press;

import tn.federation.backend.entities.press.PressItem;
import tn.federation.backend.entities.press.PressType;
import java.util.List;

public interface IPressService {
    PressItem addPressItem(PressItem pressItem);
    PressItem updatePressItem(PressItem pressItem);
    void deletePressItem(long id);
    PressItem getPressItemById(long id);
    List<PressItem> getAll();
    List<PressItem> getByType(PressType type);
    List<PressItem> getByTypeAndDiscipline(PressType type, String discipline);
    PressItem publish(long id);
    PressItem archive(long id);
    List<PressItem> getMediaByParent(long parentId);
}
