package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import tn.federation.backend.entities.SeriesParticipant;

import java.util.List;

public interface SeriesParticipantRepository extends JpaRepository<SeriesParticipant, Long> {
    List<SeriesParticipant> findBySeriesIdOrderByLane(Long seriesId);

    @Query("SELECT sp FROM SeriesParticipant sp " +
            "JOIN sp.series s " +
            "JOIN s.event e " +
            "JOIN e.day d " +
            "WHERE d.competition.id = :competitionId " +
            "ORDER BY d.dayNumber, e.eventNumber, s.seriesNumber, sp.lane")
    List<SeriesParticipant> findAllByCompetitionId(Long competitionId);
}
