package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.federation.backend.entities.CompetitionDay;

import java.util.List;

public interface CompetitionDayRepository extends JpaRepository<CompetitionDay, Long> {
    List<CompetitionDay> findByCompetitionIdOrderByDayNumber(Long competitionId);
}
