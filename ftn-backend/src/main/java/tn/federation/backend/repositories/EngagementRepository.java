package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import tn.federation.backend.entities.Engagement;
import tn.federation.backend.entities.EngagementStatus;

import java.util.List;
import java.util.Optional;

public interface EngagementRepository extends JpaRepository<Engagement, Long> {

    /** Count active engagements (not REFUSEE) for a swimmer in a competition */
    @Query("SELECT COUNT(e) FROM Engagement e WHERE e.swimmer.id = :swimmerId " +
            "AND e.competition.id = :competitionId AND e.status <> :excludedStatus")
    long countBySwimmerAndCompetitionExcludingStatus(
            @Param("swimmerId") Long swimmerId,
            @Param("competitionId") Long competitionId,
            @Param("excludedStatus") EngagementStatus excludedStatus);

    /** Check if swimmer is already engaged on a specific event */
    Optional<Engagement> findBySwimmerIdAndEventId(Long swimmerId, Long eventId);

    /** All engagements for a competition */
    List<Engagement> findByCompetitionId(Long competitionId);

    /** All engagements for a swimmer in a competition */
    List<Engagement> findBySwimmerIdAndCompetitionId(Long swimmerId, Long competitionId);

    /** All engagements for a club in a competition (for club validation) */
    List<Engagement> findByClubIdAndCompetitionId(Long clubId, Long competitionId);

    /** All engagements for a specific event */
    List<Engagement> findByEventId(Long eventId);

    /** All engagements by status for a competition */
    List<Engagement> findByCompetitionIdAndStatus(Long competitionId, EngagementStatus status);
}
