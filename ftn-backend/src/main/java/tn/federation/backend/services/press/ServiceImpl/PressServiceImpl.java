package tn.federation.backend.services.press.ServiceImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.federation.backend.entities.press.PressItem;
import tn.federation.backend.entities.press.PressStatus;
import tn.federation.backend.entities.press.PressType;
import tn.federation.backend.repositories.press.IPressItemRepository;
import tn.federation.backend.services.press.Abstraction.IPressService;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PressServiceImpl implements IPressService {

    @Autowired
    private IPressItemRepository pressItemRepository;

    @Override
    public List<PressItem> getAll() {
        return pressItemRepository.findAll();
    }

    @Override
    public PressItem getPressItemById(long id) {
        return pressItemRepository.findById(id).orElse(null);
    }

    @Override
    public PressItem add(PressItem pressItem) {
        if (pressItem.getStatus() == null) {
            pressItem.setStatus(PressStatus.DRAFT);
        }
        return pressItemRepository.save(pressItem);
    }

    @Override
    public PressItem update(long id, PressItem pressItem) {
        if (pressItemRepository.existsById(id)) {
            pressItem.setIdPressItem(id);
            return pressItemRepository.save(pressItem);
        }
        return null;
    }

    @Override
    public void deletePressItem(long id) {
        pressItemRepository.deleteById(id);
    }

    @Override
    public PressItem publish(long id) {
        PressItem item = getPressItemById(id);
        if (item != null) {
            item.setStatus(PressStatus.PUBLISHED);
            item.setPublishedAt(LocalDateTime.now());
            return pressItemRepository.save(item);
        }
        return null;
    }

    @Override
    public PressItem archive(long id) {
        PressItem item = getPressItemById(id);
        if (item != null) {
            item.setStatus(PressStatus.ARCHIVED);
            return pressItemRepository.save(item);
        }
        return null;
    }

    @Override
    public List<PressItem> getByType(PressType type) {
        return pressItemRepository.findByType(type);
    }

    @Override
    public List<PressItem> getByTypeAndDiscipline(PressType type, String discipline) {
        return pressItemRepository.findByTypeAndDiscipline(type, discipline);
    }

    @Override
    public List<PressItem> getMediaByParent(long parentId) {
        return pressItemRepository.findByParentPressItem_IdPressItem(parentId);
    }
}
