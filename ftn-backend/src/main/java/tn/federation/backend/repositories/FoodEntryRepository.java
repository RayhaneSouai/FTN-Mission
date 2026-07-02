package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.federation.backend.entities.FoodEntry;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface FoodEntryRepository extends JpaRepository<FoodEntry, Long> {
    List<FoodEntry> findByUserIdAndEntryDateOrderByCreatedAtAsc(Long userId, LocalDate date);
    List<FoodEntry> findByUserIdAndEntryDateBetweenOrderByEntryDateAsc(Long userId, LocalDate start, LocalDate end);

    @Query("SELECT COALESCE(SUM(f.calories), 0) FROM FoodEntry f WHERE f.userId = :userId AND f.entryDate = :date")
    int sumCaloriesByUserAndDate(@Param("userId") Long userId, @Param("date") LocalDate date);

    @Query("SELECT COALESCE(SUM(f.protein), 0) FROM FoodEntry f WHERE f.userId = :userId AND f.entryDate = :date")
    int sumProteinByUserAndDate(@Param("userId") Long userId, @Param("date") LocalDate date);

    @Query("SELECT COALESCE(SUM(f.carbs), 0) FROM FoodEntry f WHERE f.userId = :userId AND f.entryDate = :date")
    int sumCarbsByUserAndDate(@Param("userId") Long userId, @Param("date") LocalDate date);

    @Query("SELECT COALESCE(SUM(f.fat), 0) FROM FoodEntry f WHERE f.userId = :userId AND f.entryDate = :date")
    int sumFatByUserAndDate(@Param("userId") Long userId, @Param("date") LocalDate date);
    
    @Query("SELECT COALESCE(SUM(f.waterMl), 0.0) FROM FoodEntry f WHERE f.userId = :userId AND f.entryDate = :date")
    double sumWaterByUserAndDate(@Param("userId") Long userId, @Param("date") LocalDate date);
}
