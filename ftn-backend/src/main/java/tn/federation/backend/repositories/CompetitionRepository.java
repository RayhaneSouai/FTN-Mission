package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.federation.backend.entities.Competition;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CompetitionRepository extends CrudRepository<Competition, Long> {

    List<Competition> findByArchivedTrue();

    List<Competition> findByArchivedFalse();

    /**
     * Returns competitions explicitly archived OR whose endDate is before the given
     * date
     */
    @Query("SELECT c FROM Competition c WHERE c.archived = true OR c.endDate < :date")
    List<Competition> findArchivedOrEndedBefore(@Param("date") LocalDate date);
}
