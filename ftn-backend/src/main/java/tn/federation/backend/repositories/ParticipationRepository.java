package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.federation.backend.entities.Participation;
import tn.federation.backend.entities.ParticipationRequestStatus;

import java.util.List;
import java.util.Optional;

public interface ParticipationRepository extends JpaRepository<Participation, Long> {

    Optional<Participation> findBySwimmerIdAndCompetitionId(Long swimmerId, Long competitionId);

    List<Participation> findByStatus(ParticipationRequestStatus status);

    List<Participation> findByCompetitionId(Long competitionId);

    List<Participation> findBySwimmerId(Long swimmerId);
}
