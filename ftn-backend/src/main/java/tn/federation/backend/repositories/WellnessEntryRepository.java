package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.federation.backend.entities.WellnessEntry;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface WellnessEntryRepository extends JpaRepository<WellnessEntry, Long> {
    Optional<WellnessEntry> findByUserIdAndEntryDate(Long userId, LocalDate date);
    List<WellnessEntry> findByUserIdAndEntryDateBetweenOrderByEntryDateAsc(Long userId, LocalDate start, LocalDate end);
    List<WellnessEntry> findTop7ByUserIdOrderByEntryDateDesc(Long userId);
}
