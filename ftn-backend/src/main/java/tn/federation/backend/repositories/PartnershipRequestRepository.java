package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import tn.federation.backend.entities.PartnershipRequest;
import tn.federation.backend.entities.PartnershipRequestStatus;

import java.util.List;

public interface PartnershipRequestRepository extends JpaRepository<PartnershipRequest, Long> {

    List<PartnershipRequest> findByStatutOrderByCreatedAtDesc(PartnershipRequestStatus statut);

    List<PartnershipRequest> findAllByOrderByCreatedAtDesc();

    @Query("SELECT p FROM PartnershipRequest p WHERE p.addedValueScore >= :minScore ORDER BY p.addedValueScore DESC")
    List<PartnershipRequest> findHighValueRequests(int minScore);
}