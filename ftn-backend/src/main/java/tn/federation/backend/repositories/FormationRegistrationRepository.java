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
}
