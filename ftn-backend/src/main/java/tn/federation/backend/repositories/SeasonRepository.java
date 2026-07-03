package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.federation.backend.entities.Season;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeasonRepository extends JpaRepository<Season, Long> {
    List<Season> findAllByOrderByLabelDesc();

    boolean existsByLabel(String label);

    List<Season> findByActiveTrue();

    Optional<Season> findFirstByActiveTrueOrderByCreatedAtAsc();
}
