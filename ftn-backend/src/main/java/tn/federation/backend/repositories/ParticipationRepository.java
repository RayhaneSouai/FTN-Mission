package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.federation.backend.entities.Participation;
import tn.federation.backend.entities.ParticipationRequestStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface ParticipationRepository extends JpaRepository<Participation, Long> {

    Optional<Participation> findBySwimmerIdAndCompetitionId(Long swimmerId, Long competitionId);

    List<Participation> findByStatus(ParticipationRequestStatus status);

    List<Participation> findByCompetitionId(Long competitionId);

    List<Participation> findByCompetitionIdAndStatus(Long competitionId, ParticipationRequestStatus status);

    List<Participation> findBySwimmerId(Long swimmerId);

    @Query("SELECT p FROM Participation p WHERE p.competition.id = :competitionId AND p.officialTime IS NOT NULL AND (p.disqualified IS NULL OR p.disqualified = false) ORDER BY p.officialTime ASC")
    List<Participation> findCompetitionResults(@Param("competitionId") Long competitionId);
}
