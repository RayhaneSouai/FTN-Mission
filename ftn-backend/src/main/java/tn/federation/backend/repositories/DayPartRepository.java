package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.federation.backend.entities.DayPart;

import java.util.List;

public interface DayPartRepository extends JpaRepository<DayPart, Long> {
    List<DayPart> findByDayIdOrderBySortOrder(Long dayId);
}
