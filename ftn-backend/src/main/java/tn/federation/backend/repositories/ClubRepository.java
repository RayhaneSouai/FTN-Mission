package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import tn.federation.backend.entities.Club;
import tn.federation.backend.entities.Role;
import tn.federation.backend.entities.User;

import java.util.List;

@Repository
public interface ClubRepository extends CrudRepository<Club, Long> {

    // Category 2 — Business methods
    List<Club> findByRegion(String region);

    List<Club> findByNameContainingIgnoreCaseOrRegionContainingIgnoreCase(String name, String region);

    // clubs with coordinates for map
    List<Club> findByLatitudeIsNotNullAndLongitudeIsNotNull();

    // swimmers in a specific club
    @Query("SELECT u FROM User u WHERE u.club.id = :clubId AND u.role = :role")
    List<User> findUsersByClubIdAndRole(Long clubId, Role role);

    // ranking clubs by swimmer count descending
    @Query("SELECT c FROM Club c ORDER BY " +
            "(SELECT COUNT(u) FROM User u WHERE u.club = c AND u.role = 'SWIMMER') DESC")
    List<Club> findClubsRankedBySwimmerCount();
}
