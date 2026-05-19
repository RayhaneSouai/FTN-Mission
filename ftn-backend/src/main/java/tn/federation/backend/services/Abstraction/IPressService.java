package tn.federation.backend.services.Abstraction;

import tn.federation.backend.entities.PressItem;
import tn.federation.backend.entities.PressType;
import tn.federation.backend.dto.PressStatsDTO;
import java.util.List;
import java.time.LocalDateTime;

public interface IPressService {
    List<PressItem> getAll();
    PressItem getPressItemById(long id);
    PressItem add(PressItem pressItem);
    PressItem update(long id, PressItem pressItem);
    void deletePressItem(long id);
    PressItem publish(long id);
    PressItem archive(long id);
    PressItem draft(long id);

    PressItem schedule(long id, LocalDateTime scheduledAt);
    void incrementViews(long id);
    void incrementDownloads(long id);
    List<PressItem> getPopular(int limit);
    List<PressItem> getByType(PressType type);
    List<PressItem> getByTypeAndDiscipline(PressType type, String discipline);

    PressStatsDTO getStats();
}
