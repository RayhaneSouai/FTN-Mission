package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.federation.backend.entities.EventSeries;

import java.util.List;

public interface EventSeriesRepository extends JpaRepository<EventSeries, Long> {
    List<EventSeries> findByEventIdOrderBySeriesNumber(Long eventId);
}
