package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.federation.backend.entities.TrainingSession;

import java.util.List;

@Repository
public interface TrainingSessionRepository extends JpaRepository<TrainingSession, Long> {
    List<TrainingSession> findByProgram_IdOrderBySessionDateAscStartTimeAsc(Long programId);

    long countByProgram_Id(Long programId);
}
