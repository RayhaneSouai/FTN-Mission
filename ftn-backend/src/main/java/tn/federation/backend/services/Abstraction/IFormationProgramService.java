package tn.federation.backend.services.Abstraction;

import tn.federation.backend.entities.FormationProgram;

import java.util.List;

public interface IFormationProgramService {
    List<FormationProgram> findBySeason(Long seasonId);

    FormationProgram findById(Long id);

    FormationProgram create(FormationProgram program);

    FormationProgram update(Long id, FormationProgram program);

    void delete(Long id);

    List<FormationProgram> getCoachCertificationPrograms(Long seasonId);

    List<FormationProgram> getSwimmerTrainingPrograms(Long seasonId);

    List<FormationProgram> getEligiblePrograms(String niveau);
}
