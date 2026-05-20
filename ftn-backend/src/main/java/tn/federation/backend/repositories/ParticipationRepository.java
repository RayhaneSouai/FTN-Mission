package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
<<<<<<< HEAD
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
=======
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.federation.backend.entities.Participation;
import java.util.List;
@Repository public interface ParticipationRepository extends JpaRepository<Participation, Long> {
    @Query(" SELECT p FROM Participation p WHERE p.competition.id = :competitionId AND p.officialTime IS NOT NULL AND (p.disqualified IS NULL OR p.disqualified = false) ORDER BY p.officialTime ASC ")
    List<Participation> findCompetitionResults(@Param("competitionId") Long competitionId); }

>>>>>>> 2676ef2f4156bf4d0841159873337acc200d2ced
