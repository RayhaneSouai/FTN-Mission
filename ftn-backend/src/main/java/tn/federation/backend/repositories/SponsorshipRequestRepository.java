package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import tn.federation.backend.entities.SponsorshipRequest;

public interface SponsorshipRequestRepository extends JpaRepository<SponsorshipRequest, Long> {
}

