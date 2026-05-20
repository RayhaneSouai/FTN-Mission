package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.federation.backend.entities.CompetitionEvent;

import java.util.List;

public interface CompetitionEventRepository extends JpaRepository<CompetitionEvent, Long> {
    List<CompetitionEvent> findByDayIdOrderByEventNumber(Long dayId);

    /** All events belonging to a competition (via day→competition) */
    List<CompetitionEvent> findByDayCompetitionId(Long competitionId);
}
