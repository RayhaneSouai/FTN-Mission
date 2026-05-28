package tn.federation.backend.repositories;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.federation.backend.entities.*;

import java.util.List;
import java.util.Optional;

@Repository
public interface PerformanceRepository extends JpaRepository<Performance, Long> {
    // Simple queries
    List<Performance> findBySwimmerIdOrderByDateDesc(Long swimmerId);
    List<Performance> findBySwimmerIdOrderByDateAsc(Long swimmerId);
    List<Performance> findBySwimmerIdAndDistanceAndStrokeOrderByDateDesc(Long swimmerId, Integer distance, StrokeType stroke);

    // National record query (single result)
    @Query("SELECT p FROM Performance p WHERE p.distance = :distance AND p.stroke = :stroke AND p.swimmer.gender = :gender ORDER BY p.time ASC")
    List<Performance> findNationalRecord(@Param("distance") Integer distance,
                                            @Param("stroke") StrokeType stroke,
                                            @Param("gender") Gender gender);

    // National ranking with pagination
    @Query("SELECT p FROM Performance p WHERE p.distance = :distance AND p.stroke = :stroke AND p.swimmer.gender = :gender AND (:niveau IS NULL OR p.swimmer.niveau = :niveau) ORDER BY p.time ASC")
    List<Performance> findNationalRanking(@Param("distance") Integer distance,
                                          @Param("stroke") StrokeType stroke,
                                          @Param("gender") Gender gender,
                                          @Param("niveau") Niveau niveau,
                                          Pageable pageable);

        // New method to retrieve top 50 performances for ranking
    @Query("SELECT p FROM Performance p WHERE p.distance = :distance AND p.stroke = :stroke AND p.swimmer.gender = :gender AND (:niveau IS NULL OR p.swimmer.niveau = :niveau) ORDER BY p.time ASC")
    List<Performance> findTop50ByDistanceAndStrokeAndSwimmerGenderOrderByTimeAsc(@Param("distance") Integer distance,
                                                                                  @Param("stroke") StrokeType stroke,
                                                                                  @Param("gender") Gender gender,
                                                                                  @Param("niveau") Niveau niveau);
    long countBySwimmerId(@Param("swimmerId") Long swimmerId);

    @Query("SELECT p FROM Performance p WHERE p.swimmer.id = :swimmerId AND p.isPersonalRecord = true ORDER BY p.distance ASC, p.stroke ASC")
    List<Performance> findPersonalRecordsBySwimmer(@Param("swimmerId") Long swimmerId);
    // All national records
    @Query("SELECT p FROM Performance p WHERE p.time = (SELECT MIN(p2.time) FROM Performance p2 WHERE p2.distance = p.distance AND p2.stroke = p.stroke AND p2.swimmer.gender = p.swimmer.gender) ORDER BY p.swimmer.gender, p.distance, p.stroke")
    List<Performance> findAllNationalRecords();

    // Additional query used elsewhere (kept for compatibility)
    @Query("SELECT p FROM Performance p JOIN FETCH p.swimmer s LEFT JOIN FETCH s.club WHERE p.distance = :distance AND p.stroke = :stroke AND p.swimmer.gender = :gender AND p.time = (SELECT MIN(p2.time) FROM Performance p2 WHERE p2.distance = :distance AND p2.stroke = :stroke AND p2.swimmer.gender = :gender) ORDER BY p.time ASC")
    Optional<Performance> findNationalRecordDetailed(@Param("distance") Integer distance,
                                                    @Param("stroke") StrokeType stroke,
                                                    @Param("gender") Gender gender);
}