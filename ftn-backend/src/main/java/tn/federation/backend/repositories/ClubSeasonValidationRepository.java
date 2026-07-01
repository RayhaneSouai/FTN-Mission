package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.federation.backend.entities.ClubSeasonValidation;

import java.util.Optional;

@Repository
public interface ClubSeasonValidationRepository extends JpaRepository<ClubSeasonValidation, Long> {
    boolean existsByClubIdAndSeasonAndIsValidatedTrue(Long clubId, String season);
    Optional<ClubSeasonValidation> findByClubIdAndSeason(Long clubId, String season);
}
