package tn.federation.backend.services.ServiceImpl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.federation.backend.entities.Season;
import tn.federation.backend.repositories.FormationProgramRepository;
import tn.federation.backend.repositories.SeasonRepository;
import tn.federation.backend.services.Abstraction.INotificationService;
import tn.federation.backend.services.Abstraction.ISeasonService;

import java.util.List;

@Service
public class SeasonServiceImpl implements ISeasonService {

    private final SeasonRepository seasonRepository;
    private final FormationProgramRepository programRepository;
    private final INotificationService notificationService;

    public SeasonServiceImpl(
            SeasonRepository seasonRepository,
            FormationProgramRepository programRepository,
            INotificationService notificationService) {
        this.seasonRepository = seasonRepository;
        this.programRepository = programRepository;
        this.notificationService = notificationService;
    }

    @Override
    public List<Season> findAll() {
        return seasonRepository.findAllByOrderByLabelDesc();
    }

    @Override
    public Season findById(Long id) {
        return seasonRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Saison introuvable"));
    }

    @Override
    public Season create(Season season) {
        if (season.getLabel() == null || season.getLabel().isBlank()) {
            throw new IllegalArgumentException("Le libellé de la saison est obligatoire");
        }
        if (seasonRepository.existsByLabel(season.getLabel().trim())) {
            throw new IllegalArgumentException("Cette saison existe déjà");
        }
        season.setLabel(season.getLabel().trim());
        Season saved = seasonRepository.save(season);
        if (saved.isActive()) {
            notificationService.requestSeasonValidationForAllCoaches(saved.getLabel());
        }
        return saved;
    }

    @Override
    public Season update(Long id, Season season) {
        Season existing = findById(id);
        boolean wasActive = existing.isActive();
        if (season.getLabel() != null && !season.getLabel().isBlank()) {
            String label = season.getLabel().trim();
            if (!label.equals(existing.getLabel()) && seasonRepository.existsByLabel(label)) {
                throw new IllegalArgumentException("Cette saison existe déjà");
            }
            existing.setLabel(label);
        }
        existing.setActive(season.isActive());
        Season saved = seasonRepository.save(existing);

        if (season.isActive() && !wasActive) {
            notificationService.requestSeasonValidationForAllCoaches(saved.getLabel());
        }

        return saved;
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!programRepository.findBySeason_IdOrderByCreatedAtDesc(id).isEmpty()) {
            throw new IllegalArgumentException(
                    "Impossible de supprimer : des programmes de formation sont liés à cette saison");
        }
        seasonRepository.deleteById(id);
    }
}
