package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import tn.federation.backend.entities.ProgramItem;
import tn.federation.backend.entities.ProgramItemType;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface ProgramItemRepository extends JpaRepository<ProgramItem, Long> {
    List<ProgramItem> findByDayIdOrderByTimeAsc(Long dayId);

    List<ProgramItem> findByDayCompetitionIdAndType(Long competitionId, ProgramItemType type);

    @Query("SELECT MAX(p.time) FROM ProgramItem p WHERE p.day.id = :dayId")
    Optional<LocalTime> findMaxTimeByDayId(Long dayId);

    @Query("SELECT MAX(p.time) FROM ProgramItem p WHERE p.day.id = :dayId AND p.id != :excludeItemId")
    Optional<LocalTime> findMaxTimeByDayIdExcluding(Long dayId, Long excludeItemId);
}
