package tn.federation.backend.services.ServiceImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import tn.federation.backend.entities.Competition;
import tn.federation.backend.entities.ProgrammeStatus;
import tn.federation.backend.repositories.CompetitionRepository;
import tn.federation.backend.services.Abstraction.ICompetitionService;
import tn.federation.backend.utils.AgeCategoryUtil;

import java.util.List;

@Service
public class CompetitionServiceImpl implements ICompetitionService {

    @Autowired
    CompetitionRepository competitionRepository;

    @Override
    public Competition addCompetition(Competition competition) {
        validateDates(competition);
        validateMinima(competition);
        deriveAgeLimits(competition);
        return competitionRepository.save(competition);
    }

    @Override
    public Competition updateCompetition(Competition competition) {
        Competition existing = competitionRepository.findById(competition.getId())
                .orElseThrow(() -> new RuntimeException("Competition not found: " + competition.getId()));

        enforceNotLocked(existing);

        existing.setName(competition.getName());
        existing.setDescription(competition.getDescription());
        existing.setDiscipline(competition.getDiscipline());
        existing.setStartDate(competition.getStartDate());
        existing.setEndDate(competition.getEndDate());
        existing.setLieu(competition.getLieu());
        existing.setRegion(competition.getRegion());
        existing.setAllowedCategories(competition.getAllowedCategories());
        existing.setStatus(competition.getStatus());
        if (competition.getProgrammeStatus() != null) {
            existing.setProgrammeStatus(competition.getProgrammeStatus());
        }
        existing.setParticipationDeadline(competition.getParticipationDeadline());
        existing.setAllowedGender(competition.getAllowedGender());
        existing.setMaxEvents(competition.getMaxEvents());
        existing.setCustomConditions(competition.getCustomConditions());
        existing.setLicenseRequired(competition.getLicenseRequired());
        existing.setMedicalCertificateRequired(competition.getMedicalCertificateRequired());
        existing.setHasMinimas(competition.getHasMinimas());
        existing.setMinimaTime(competition.getHasMinimas() != null && competition.getHasMinimas()
                ? competition.getMinimaTime()
                : null);

        validateDates(existing);
        validateMinima(existing);
        deriveAgeLimits(existing);

        return competitionRepository.save(existing);
    }

    @Override
    public void deleteCompetition(long id) {
        Competition existing = competitionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Competition not found: " + id));
        enforceNotLocked(existing);
        competitionRepository.deleteById(id);
    }

    @Override
    public Competition getCompetitionById(long id) {
        return competitionRepository.findById(id).get();
    }

    @Override
    public List<Competition> getAllCompetitions() {
        return (List<Competition>) competitionRepository.findAll();
    }

    /**
     * Validates date logic:
     * - startDate <= endDate
     * - participationDeadline < startDate (if set)
     */
    private void validateDates(Competition comp) {
        if (comp.getStartDate() != null && comp.getEndDate() != null
                && comp.getStartDate().isAfter(comp.getEndDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La date de début doit être antérieure ou égale à la date de fin.");
        }
        if (comp.getParticipationDeadline() != null && comp.getStartDate() != null
                && !comp.getParticipationDeadline().isBefore(comp.getStartDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La date limite d'inscription doit être strictement antérieure à la date de début.");
        }
    }

    private void validateMinima(Competition comp) {
        if (comp.getHasMinimas() != null && comp.getHasMinimas()) {
            if (comp.getMinimaTime() == null || comp.getMinimaTime() <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Veuillez saisir la valeur des minima avant de continuer.");
            }
        }
    }

    private void enforceNotLocked(Competition comp) {
        if (comp.getProgrammeStatus() == ProgrammeStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Cette compétition est verrouillée car le programme a été approuvé.");
        }
    }

    /**
     * Auto-derives minAge/maxAge from the set of allowed categories.
     */
    private void deriveAgeLimits(Competition comp) {
        comp.setMinAge(AgeCategoryUtil.deriveMinAge(comp.getAllowedCategories()));
        comp.setMaxAge(AgeCategoryUtil.deriveMaxAge(comp.getAllowedCategories()));
    }
}