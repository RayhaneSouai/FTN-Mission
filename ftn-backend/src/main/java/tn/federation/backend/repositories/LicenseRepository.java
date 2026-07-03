package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.federation.backend.entities.License;

import java.util.List;
import java.util.Optional;

@Repository
public interface LicenseRepository extends JpaRepository<License, Long> {
    List<License> findBySeason(String season);

    List<License> findByClub_Id(Long clubId);

    Optional<License> findByLicenseNumber(String licenseNumber);

    void deleteByClub_Id(Long clubId);
}
