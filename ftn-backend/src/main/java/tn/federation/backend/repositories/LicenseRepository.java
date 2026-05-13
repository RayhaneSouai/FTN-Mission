package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.federation.backend.entities.License;

import java.util.List;

@Repository
public interface LicenseRepository extends JpaRepository<License, Long> {
    List<License> findBySeason(String season);
}
