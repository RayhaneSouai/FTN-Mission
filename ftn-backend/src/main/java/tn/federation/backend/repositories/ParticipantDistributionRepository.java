package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.federation.backend.entities.DistributionStatus;
import tn.federation.backend.entities.ParticipantDistribution;

import java.util.List;

@Repository
public interface ParticipantDistributionRepository extends JpaRepository<ParticipantDistribution, Long> {

    List<ParticipantDistribution> findByCompetitionIdOrderBySeriesIdAscPositionAsc(Long competitionId);

    List<ParticipantDistribution> findByCompetitionIdAndStatus(Long competitionId, DistributionStatus status);

    List<ParticipantDistribution> findByCompetitionIdAndSwimmerId(Long competitionId, Long swimmerId);

    void deleteByCompetitionId(Long competitionId);

    boolean existsByCompetitionId(Long competitionId);

    boolean existsByCompetitionIdAndStatus(Long competitionId, DistributionStatus status);
}
