package tn.federation.backend.services.ServiceImpl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.federation.backend.entities.FormationDocument;
import tn.federation.backend.entities.FormationProgram;
import tn.federation.backend.entities.FormationScheduleItem;
import tn.federation.backend.entities.ProgramType;
import tn.federation.backend.entities.Season;
import tn.federation.backend.entities.User;
import tn.federation.backend.exceptions.ResourceConflictException;
import tn.federation.backend.repositories.FormationCertificateRepository;
import tn.federation.backend.repositories.FormationProgramRepository;
import tn.federation.backend.repositories.FormationRegistrationRepository;
import tn.federation.backend.repositories.SeasonRepository;
import tn.federation.backend.repositories.UserRepository;
import tn.federation.backend.services.Abstraction.IFormationProgramService;

import java.util.List;

@Service
public class FormationProgramServiceImpl implements IFormationProgramService {

    private final FormationProgramRepository programRepository;
    private final SeasonRepository seasonRepository;
    private final FormationRegistrationRepository registrationRepository;
    private final FormationCertificateRepository certificateRepository;
    private final UserRepository userRepository;

    public FormationProgramServiceImpl(
            FormationProgramRepository programRepository,
            SeasonRepository seasonRepository,
            FormationRegistrationRepository registrationRepository,
            FormationCertificateRepository certificateRepository,
            UserRepository userRepository) {
        this.programRepository = programRepository;
        this.seasonRepository = seasonRepository;
        this.registrationRepository = registrationRepository;
        this.certificateRepository = certificateRepository;
        this.userRepository = userRepository;
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
        attachDocuments(program.getDocuments(), entity);
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
        existing.getDocuments().clear();
        attachDocuments(program.getDocuments(), existing);
        FormationProgram saved = programRepository.save(existing);
        return programRepository.findById(saved.getId()).orElse(saved);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        long registrations = registrationRepository.countByProgram_Id(id);
        long certificates = certificateRepository.countByProgram_Id(id);
        if (registrations > 0 || certificates > 0) {
            throw new ResourceConflictException(
                    "Impossible de supprimer : " + registrations + " inscription(s) et "
                    + certificates + " certificat(s) sont liés à ce programme.");
        }
        programRepository.deleteById(id);
    }

    @Override
    public List<FormationProgram> getCoachCertificationPrograms(Long seasonId) {
        List<FormationProgram> programs = seasonId != null
                ? programRepository.findByProgramTypeAndSeason_IdOrderByCreatedAtDesc(ProgramType.COACH_CERTIFICATION, seasonId)
                : programRepository.findByProgramTypeOrderByCreatedAtDesc(ProgramType.COACH_CERTIFICATION);
        applyRegisteredCounts(programs);
        return programs;
    }

    @Override
    public List<FormationProgram> getSwimmerTrainingPrograms(Long seasonId) {
        List<FormationProgram> programs = seasonId != null
                ? programRepository.findByProgramTypeAndSeason_IdOrderByCreatedAtDesc(ProgramType.SWIMMER_TRAINING, seasonId)
                : programRepository.findByProgramTypeOrderByCreatedAtDesc(ProgramType.SWIMMER_TRAINING);
        applyRegisteredCounts(programs);
        return programs;
    }

    @Override
    public List<FormationProgram> getEligiblePrograms(String niveau) {
        List<FormationProgram> programs = programRepository.findEligiblePrograms(niveau == null ? "" : niveau);
        applyRegisteredCounts(programs);
        return programs;
    }

    /** Populates the transient registeredCount field via the existing countRegistrationsPerProgram JPQL query. */
    private void applyRegisteredCounts(List<FormationProgram> programs) {
        java.util.Map<Long, Long> counts = programRepository.countRegistrationsPerProgram().stream()
                .collect(java.util.stream.Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Long) row[2]));
        programs.forEach(p -> p.setRegisteredCount(counts.getOrDefault(p.getId(), 0L).intValue()));
    }

    private void validateProgram(FormationProgram program) {
        if (program.getTitle() == null || program.getTitle().isBlank()) {
            throw new IllegalArgumentException("Le titre du programme est obligatoire");
        }
        if (program.getSeason() == null || program.getSeason().getId() == null) {
            throw new IllegalArgumentException("La saison est obligatoire");
        }
        ProgramType type = program.getProgramType() != null ? program.getProgramType() : ProgramType.COACH_CERTIFICATION;
        if (type == ProgramType.COACH_CERTIFICATION) {
            if (program.getBrevetType() == null) {
                throw new IllegalArgumentException("Le type de brevet (BF1/BF2) est obligatoire");
            }
        } else {
            if (program.getTargetCategory() == null) {
                throw new IllegalArgumentException("La catégorie visée est obligatoire pour un programme nageurs");
            }
            if (program.getCoach() == null || program.getCoach().getId() == null) {
                throw new IllegalArgumentException("Le coach responsable est obligatoire pour un programme nageurs");
            }
        }
    }

    private Season resolveSeason(FormationProgram program) {
        return seasonRepository.findById(program.getSeason().getId())
                .orElseThrow(() -> new IllegalArgumentException("Saison introuvable"));
    }

    private User resolveCoach(FormationProgram program) {
        if (program.getCoach() == null || program.getCoach().getId() == null) {
            return null;
        }
        return userRepository.findById(program.getCoach().getId())
                .orElseThrow(() -> new IllegalArgumentException("Coach introuvable"));
    }

    private void copyFields(FormationProgram source, FormationProgram target) {
        target.setTitle(source.getTitle().trim());
        target.setProgramType(source.getProgramType() != null ? source.getProgramType() : ProgramType.COACH_CERTIFICATION);
        target.setBrevetType(source.getBrevetType());
        target.setTargetCategory(source.getTargetCategory());
        target.setMaxParticipants(source.getMaxParticipants());
        target.setCoach(resolveCoach(source));
        target.setLocation(source.getLocation());
        target.setPricePerSession(source.getPricePerSession());
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

    private void attachDocuments(List<FormationDocument> documents, FormationProgram program) {
        if (documents == null) {
            return;
        }
        int order = 0;
        for (FormationDocument document : documents) {
            if (document == null || document.getTitle() == null || document.getTitle().isBlank()
                    || document.getUrl() == null || document.getUrl().isBlank()) {
                continue;
            }
            FormationDocument row = new FormationDocument();
            row.setTitle(document.getTitle().trim());
            row.setUrl(document.getUrl().trim());
            row.setType(document.getType());
            row.setSortOrder(document.getSortOrder() != null && document.getSortOrder() > 0
                    ? document.getSortOrder()
                    : order);
            row.setProgram(program);
            program.getDocuments().add(row);
            order++;
        }
    }
}
