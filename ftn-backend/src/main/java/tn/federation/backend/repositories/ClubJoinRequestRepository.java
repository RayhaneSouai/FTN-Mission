package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.federation.backend.entities.ClubJoinRequest;
import tn.federation.backend.entities.ClubJoinRequestStatus;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClubJoinRequestRepository extends JpaRepository<ClubJoinRequest, Long> {
    boolean existsBySwimmer_IdAndStatus(Long swimmerId, ClubJoinRequestStatus status);

    Optional<ClubJoinRequest> findBySwimmer_IdAndClub_IdAndStatus(
            Long swimmerId,
            Long clubId,
            ClubJoinRequestStatus status
    );

    List<ClubJoinRequest> findByStatusOrderByRequestedAtDesc(ClubJoinRequestStatus status);

    List<ClubJoinRequest> findBySwimmer_IdOrderByRequestedAtDesc(Long swimmerId);
}
