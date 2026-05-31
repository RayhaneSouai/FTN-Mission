package tn.federation.backend.services.ServiceImpl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.federation.backend.entities.FormationProgram;
import tn.federation.backend.entities.FormationScheduleItem;
import tn.federation.backend.entities.Season;
import tn.federation.backend.repositories.FormationProgramRepository;
import tn.federation.backend.repositories.SeasonRepository;
import tn.federation.backend.services.Abstraction.IFormationProgramService;

import java.util.List;

@Service
public class FormationProgramServiceImpl implements IFormationProgramService {

    private final FormationProgramRepository programRepository;
    private final SeasonRepository seasonRepository;

    public FormationProgramServiceImpl(
            FormationProgramRepository programRepository,
            SeasonRepository seasonRepository) {
        this.programRepository = programRepository;
        this.seasonRepository = seasonRepository;
    }

    @Override
    public List<FormationProgram> findBySeason(Long seasonId) {
        return programRepository.findBySeason_IdOrderByCreatedAtDesc(seasonId);
    }

    @Override
    public FormationProgram findById(Long id) {
        return programRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Programme introuvable"));
    }

    @Override
    @Transactional
    public FormationProgram create(FormationProgram program) {
        validateProgram(program);
        Season season = resolveSeason(program);
        FormationProgram entity = new FormationProgram();
        copyFields(program, entity);
        entity.setSeason(season);
        attachScheduleItems(program.getScheduleItems(), entity);
        FormationProgram saved = programRepository.save(entity);
        return programRepository.findById(saved.getId()).orElse(saved);
    }

    @Override
    @Transactional
    public FormationProgram update(Long id, FormationProgram program) {
        validateProgram(program);
        FormationProgram existing = findById(id);
        if (program.getSeason() != null && program.getSeason().getId() != null) {
            existing.setSeason(resolveSeason(program));
        }
        copyFields(program, existing);
        existing.getScheduleItems().clear();
        attachScheduleItems(program.getScheduleItems(), existing);
        FormationProgram saved = programRepository.save(existing);
        return programRepository.findById(saved.getId()).orElse(saved);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        programRepository.deleteById(id);
    }

    private void validateProgram(FormationProgram program) {
        if (program.getTitle() == null || program.getTitle().isBlank()) {
            throw new IllegalArgumentException("Le titre du programme est obligatoire");
        }
        if (program.getBrevetType() == null) {
            throw new IllegalArgumentException("Le type de brevet (BF1/BF2) est obligatoire");
        }
        if (program.getSeason() == null || program.getSeason().getId() == null) {
            throw new IllegalArgumentException("La saison est obligatoire");
        }
    }

    private Season resolveSeason(FormationProgram program) {
        return seasonRepository.findById(program.getSeason().getId())
                .orElseThrow(() -> new IllegalArgumentException("Saison introuvable"));
    }

    private void copyFields(FormationProgram source, FormationProgram target) {
        target.setTitle(source.getTitle().trim());
        target.setBrevetType(source.getBrevetType());
        if (source.getStatus() != null) {
            target.setStatus(source.getStatus());
        }
        target.setRegistrationStartDate(source.getRegistrationStartDate());
        target.setRegistrationEndDate(source.getRegistrationEndDate());
        target.setRegistrationLocation(source.getRegistrationLocation());
        target.setRegistrationConditions(source.getRegistrationConditions());
        target.setRegistrationFee(source.getRegistrationFee());
        target.setInstituteAddress(source.getInstituteAddress());
        target.setInstituteEmail(source.getInstituteEmail());
        target.setInstitutePhone(source.getInstitutePhone());
        target.setInstituteFax(source.getInstituteFax());
        target.setTheoreticalStartDate(source.getTheoreticalStartDate());
        target.setTheoreticalEndDate(source.getTheoreticalEndDate());
        target.setTheoreticalLocation(source.getTheoreticalLocation());
        target.setTheoreticalHours(source.getTheoreticalHours());
        target.setTheoreticalExamDate(source.getTheoreticalExamDate());
        target.setTheoreticalExamTime(source.getTheoreticalExamTime());
        target.setPracticalDescription(source.getPracticalDescription());
        target.setPracticalPeriodStart(source.getPracticalPeriodStart());
        target.setPracticalPeriodEnd(source.getPracticalPeriodEnd());
        target.setResultAnnouncementNote(source.getResultAnnouncementNote());
    }

    private void attachScheduleItems(List<FormationScheduleItem> items, FormationProgram program) {
        if (items == null) {
            return;
        }
        int order = 0;
        for (FormationScheduleItem item : items) {
            if (item == null) {
                continue;
            }
            FormationScheduleItem row = new FormationScheduleItem();
            row.setSortOrder(item.getSortOrder() > 0 ? item.getSortOrder() : order);
            row.setDayLabel(item.getDayLabel());
            row.setTimeSlot(item.getTimeSlot());
            row.setContent(item.getContent());
            row.setProgram(program);
            program.getScheduleItems().add(row);
            order++;
        }
    }
}
