package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.federation.backend.entities.CompetitionSeries;

import java.util.List;

public interface CompetitionSeriesRepository extends JpaRepository<CompetitionSeries, Long> {
    List<CompetitionSeries> findByDayPartIdOrderBySortOrder(Long dayPartId);
}
