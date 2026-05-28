package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.federation.backend.entities.ParticipationAudit;
import tn.federation.backend.entities.ParticipationRequestStatus;

import java.util.List;

@Repository
public interface ParticipationAuditRepository extends JpaRepository<ParticipationAudit, Long> {

    List<ParticipationAudit> findBySwimmerIdOrderByDecidedAtDesc(Long swimmerId);

    List<ParticipationAudit> findByCompetitionIdOrderByDecidedAtDesc(Long competitionId);

    List<ParticipationAudit> findByDecisionOrderByDecidedAtDesc(ParticipationRequestStatus decision);

    List<ParticipationAudit> findAllByOrderByDecidedAtDesc();
}
