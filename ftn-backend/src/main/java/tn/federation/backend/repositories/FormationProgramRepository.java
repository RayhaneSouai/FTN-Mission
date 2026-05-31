package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.federation.backend.entities.FormationProgram;

import java.util.List;

@Repository
public interface FormationProgramRepository extends JpaRepository<FormationProgram, Long> {
    List<FormationProgram> findBySeason_IdOrderByCreatedAtDesc(Long seasonId);
}
