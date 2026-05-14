package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.federation.backend.entities.Performance;

import java.util.List;

@Repository
public interface PerformanceRepository extends JpaRepository<Performance, Long> {
    List<Performance> findBySwimmerIdOrderByDateAsc(Long swimmerId);
}
