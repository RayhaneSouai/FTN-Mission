package tn.federation.backend.services.press;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.federation.backend.entities.press.PressItem;
import tn.federation.backend.entities.press.PressStatus;
import tn.federation.backend.entities.press.PressType;
import tn.federation.backend.repositories.press.IPressItemRepository;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PressServiceImpl implements IPressService {

    @Autowired
    IPressItemRepository pressRepo;

    @Override
    public PressItem addPressItem(PressItem pressItem) {
        pressItem.setStatus(PressStatus.DRAFT);
        return pressRepo.save(pressItem);
    }

    @Override
    public PressItem updatePressItem(PressItem pressItem) {
        return pressRepo.save(pressItem);
    }

    @Override
    public void deletePressItem(long id) {
        pressRepo.deleteById(id);
    }

    @Override
    public PressItem getPressItemById(long id) {
        return pressRepo.findById(id).orElse(null);
    }

    @Override
    public List<PressItem> getAll() {
        return (List<PressItem>) pressRepo.findAll();
    }

    @Override
    public List<PressItem> getByType(PressType type) {
        return pressRepo.findByType(type);
    }

    @Override
    public List<PressItem> getByTypeAndDiscipline(PressType type, String discipline) {
        return pressRepo.findByTypeAndDiscipline(type, discipline);
    }

    @Override
    public PressItem publish(long id) {
        PressItem item = getPressItemById(id);
        item.setStatus(PressStatus.PUBLISHED);
        item.setPublishedAt(LocalDateTime.now());
        return pressRepo.save(item);
    }

    @Override
    public PressItem archive(long id) {
        PressItem item = getPressItemById(id);
        item.setStatus(PressStatus.ARCHIVED);
        return pressRepo.save(item);
    }

    @Override
    public List<PressItem> getMediaByParent(long parentId) {
        return pressRepo.findByParentPressItem_IdPressItem(parentId);
    }
}
