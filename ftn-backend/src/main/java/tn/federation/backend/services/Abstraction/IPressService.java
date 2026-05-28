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
    List<PressItem> getFavoritesByUserId(Long userId);
    List<PressItem> getPinsByUserId(Long userId);

    PressStatsDTO getStats();

    // Interaction methods
    tn.federation.backend.dto.PressInteractionDTO getInteractions(long pressItemId, Long currentUserId);
    void addComment(long pressItemId, Long userId, String text);
    void toggleReaction(long pressItemId, Long userId, String reactionType);
    void toggleFavorite(long pressItemId, Long userId);
    void togglePin(long pressItemId, Long userId);
}
