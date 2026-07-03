package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.federation.backend.entities.Club;
import tn.federation.backend.entities.Discipline;
import tn.federation.backend.entities.Role;
import tn.federation.backend.entities.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClubRepository extends CrudRepository<Club, Long> {

    // ─── Existing methods ──────────────────────────────────────────────────────────

    List<Club> findByRegion(String region);
    List<Club> findByCoachId(Long coachId);

    List<Club> findByNameContainingIgnoreCaseOrRegionContainingIgnoreCase(String name, String region);

    Optional<Club> findFirstByNameIgnoreCase(String name);
    Optional<Club> findByNameIgnoreCase(String name);

    List<Club> findByLatitudeIsNotNullAndLongitudeIsNotNull();

    @Query("SELECT u FROM User u WHERE u.club.id = :clubId AND u.role = :role")
    List<User> findUsersByClubIdAndRole(Long clubId, Role role);

    @Query("SELECT c FROM Club c ORDER BY " +
            "(SELECT COUNT(u) FROM User u WHERE u.club = c AND u.role = 'SWIMMER') DESC")
    List<Club> findClubsRankedBySwimmerCount();

    // ─── Keyword methods ───────────────────────────────────────────────────────────

    // 2. Active clubs ordered by name (uses Club.active boolean)
    List<Club> findByActiveTrueOrderByNameAsc();

    // 3. Clubs by discipline (Discipline enum — exact match)
    List<Club> findByDiscipline(Discipline discipline);

    // 4. Top 5 most recent clubs by affiliation date
    List<Club> findTop5ByOrderByAffiliationDateDesc();

    // ─── JPQL queries ─────────────────────────────────────────────────────────────

    // 5. Clubs with available spots (swimmers < club's own maxCapacity)
    @Query("SELECT c FROM Club c WHERE SIZE(c.swimmers) < c.maxCapacity")
    List<Club> findClubsWithAvailableSpots();

    // 6. Clubs managed by a specific coach where the coach's account is active
    @Query("SELECT c FROM Club c WHERE c.coach.id = :coachId AND c.coach.active = true")
    List<Club> findActiveClubsByCoach(@Param("coachId") Long coachId);

    // 7. Swimmer count per club — returns [clubId, clubName, swimmerCount]
    @Query("SELECT c.id, c.name, " +
           "(SELECT COUNT(u) FROM User u WHERE u.club = c AND u.role = tn.federation.backend.entities.Role.SWIMMER) " +
           "FROM Club c " +
           "ORDER BY 3 DESC")
    List<Object[]> countSwimmersPerClub();
}
