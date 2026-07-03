package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.federation.backend.entities.FormationCertificate;

import java.util.List;
import java.util.Optional;

@Repository
public interface FormationCertificateRepository extends JpaRepository<FormationCertificate, Long> {
    List<FormationCertificate> findBySwimmer_IdOrderByIssuedAtDesc(Long swimmerId);

    Optional<FormationCertificate> findByVerificationCode(String verificationCode);

    long countByProgram_Id(Long programId);
}
