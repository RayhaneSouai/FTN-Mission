package tn.federation.backend.services.ServiceImpl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.federation.backend.entities.Season;
import tn.federation.backend.repositories.FormationProgramRepository;
import tn.federation.backend.repositories.SeasonRepository;
import tn.federation.backend.services.Abstraction.INotificationService;
import tn.federation.backend.services.Abstraction.ISeasonService;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

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
    public Optional<Season> findActive() {
        normalizeMultipleActiveSeasonsIfNeeded();
        return seasonRepository.findFirstByActiveTrueOrderByCreatedAtAsc();
    }

    @Override
    public Season findById(Long id) {
        return seasonRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Saison introuvable"));
    }

    @Override
    @Transactional
    public Season create(Season season) {
        if (season.getLabel() == null || season.getLabel().isBlank()) {
            throw new IllegalArgumentException("Le libellé de la saison est obligatoire");
        }
        if (seasonRepository.existsByLabel(season.getLabel().trim())) {
            throw new IllegalArgumentException("Cette saison existe déjà");
        }
        season.setLabel(season.getLabel().trim());
        if (season.isActive()) {
            deactivateAllSeasons();
        }
        Season saved = seasonRepository.save(season);
        if (saved.isActive()) {
            notificationService.requestSeasonValidationForAllCoaches(saved.getLabel());
        }
        return saved;
    }

    @Override
    @Transactional
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
        if (season.isActive() && !existing.isActive()) {
            deactivateAllSeasons();
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
        int programCount = programRepository.findBySeason_IdOrderByCreatedAtDesc(id).size();
        if (programCount > 0) {
            throw new tn.federation.backend.exceptions.ResourceConflictException(
                    "Impossible de supprimer : " + programCount + " programme(s) de formation sont liés à cette saison");
        }
        seasonRepository.deleteById(id);
    }

    /** When several seasons are marked active, keep the one with the most programmes. */
    private void normalizeMultipleActiveSeasonsIfNeeded() {
        List<Season> actives = seasonRepository.findByActiveTrue();
        if (actives.size() <= 1) {
            return;
        }
        Season keep = actives.stream()
                .max(Comparator.<Season>comparingInt(
                        s -> programRepository.findBySeason_IdOrderByCreatedAtDesc(s.getId()).size())
                        .thenComparing(Season::getCreatedAt))
                .orElse(actives.get(0));
        for (Season season : actives) {
            if (!season.getId().equals(keep.getId())) {
                season.setActive(false);
                seasonRepository.save(season);
            }
        }
    }

    private void deactivateAllSeasons() {
        for (Season season : seasonRepository.findByActiveTrue()) {
            season.setActive(false);
            seasonRepository.save(season);
        }
    }
}
