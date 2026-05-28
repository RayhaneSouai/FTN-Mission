
package tn.federation.backend.repositories;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.federation.backend.entities.Gender;
import tn.federation.backend.entities.Niveau;
import tn.federation.backend.entities.Performance;
import tn.federation.backend.entities.StrokeType;

import java.util.List;
import java.util.Optional;

@Repository
public interface PerformanceRepository extends JpaRepository<Performance, Long> {

    List<Performance> findBySwimmerIdOrderByDateDesc(Long swimmerId);
    List<Performance> findBySwimmerIdOrderByDateAsc(Long swimmerId);
    List<Performance> findBySwimmerIdAndDistanceAndStrokeOrderByDateDesc(Long swimmerId, Integer distance, StrokeType stroke);

    // National Record (best time for gender/distance/stroke)
    @Query("""
        SELECT p FROM Performance p
        JOIN FETCH p.swimmer s
        LEFT JOIN FETCH s.club
        WHERE p.distance = :distance
        AND p.stroke = :stroke
        AND p.swimmer.gender = :gender
        AND p.time = (
            SELECT MIN(p2.time)
            FROM Performance p2
            WHERE p2.distance = :distance
            AND p2.stroke = :stroke
            AND p2.swimmer.gender = :gender
        )
        ORDER BY p.time ASC
    """)
    List<Performance> findNationalRecord(
            @Param("distance") Integer distance,
            @Param("stroke") StrokeType stroke,
            @Param("gender") Gender gender
    );

    // National Ranking (top N by gender/distance/stroke/niveau)
    @Query("""
        SELECT p FROM Performance p
        JOIN FETCH p.swimmer s
        LEFT JOIN FETCH s.club
        WHERE p.distance = :distance
        AND p.stroke = :stroke
        AND p.swimmer.gender = :gender
        AND (:niveau IS NULL OR p.swimmer.niveau = :niveau)
        ORDER BY p.time ASC
    """)
    List<Performance> findTop50ByDistanceAndStrokeAndSwimmerGenderOrderByTimeAsc(
            @Param("distance") Integer distance,
            @Param("stroke") StrokeType stroke,
            @Param("gender") Gender gender,
            @Param("niveau") Niveau niveau,
            Pageable pageable
    );

    // Personal Records for a swimmer
    @Query("""
        SELECT p FROM Performance p
        JOIN FETCH p.swimmer s
        LEFT JOIN FETCH s.club
        WHERE p.swimmer.id = :swimmerId
        AND p.isPersonalRecord = true
        ORDER BY p.distance ASC, p.stroke ASC
    """)
    List<Performance> findPersonalRecordsBySwimmer(@Param("swimmerId") Long swimmerId);

    // All National Records (best for each gender/distance/stroke)
    @Query("""
        SELECT p FROM Performance p
        JOIN FETCH p.swimmer s
        LEFT JOIN FETCH s.club
        WHERE p.time = (
            SELECT MIN(p2.time)
            FROM Performance p2
            WHERE p2.distance = p.distance
            AND p2.stroke = p.stroke
            AND p2.swimmer.gender = p.swimmer.gender
        )
        ORDER BY p.swimmer.gender, p.distance, p.stroke
    """)
    List<Performance> findAllNationalRecords();

    // Best time for a swimmer in a specific event
    @Query("SELECT MIN(p.time) FROM Performance p WHERE p.swimmer.id = :swimmerId AND p.distance = :distance AND p.stroke = :stroke")
    Optional<Double> findBestTimeBySwimmerAndEvent(@Param("swimmerId") Long swimmerId,
                                                  @Param("distance") Integer distance,
                                                  @Param("stroke") StrokeType stroke);

}
