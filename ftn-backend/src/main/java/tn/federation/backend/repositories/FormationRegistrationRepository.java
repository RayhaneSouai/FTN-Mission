package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.federation.backend.entities.FormationRegistration;
import tn.federation.backend.entities.FormationRegistrationStatus;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface FormationRegistrationRepository extends JpaRepository<FormationRegistration, Long> {
    Optional<FormationRegistration> findByProgram_IdAndSwimmer_Id(Long programId, Long swimmerId);

    List<FormationRegistration> findBySwimmer_IdOrderByRegisteredAtDesc(Long swimmerId);

    List<FormationRegistration> findBySwimmer_IdAndStatusInOrderByRegisteredAtDesc(
            Long swimmerId,
            Collection<FormationRegistrationStatus> statuses);

    long countByProgram_Id(Long programId);

    // ─── Admin registration workflow ─────────────────────────────────────────────

    List<FormationRegistration> findByProgram_Season_IdOrderByRegisteredAtDesc(Long seasonId);

    List<FormationRegistration> findByStatusOrderByRegisteredAtDesc(FormationRegistrationStatus status);

    List<FormationRegistration> findByProgram_Season_IdAndStatusOrderByRegisteredAtDesc(
            Long seasonId, FormationRegistrationStatus status);

    List<FormationRegistration> findAllByOrderByRegisteredAtDesc();
}
