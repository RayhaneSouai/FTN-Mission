package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.federation.backend.entities.PartnershipRequest;

public interface PartnershipRequestRepository extends JpaRepository<PartnershipRequest, Long> {
}

