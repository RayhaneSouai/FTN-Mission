package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.federation.backend.entities.InjuryRecord;
import java.util.List;

@Repository
public interface InjuryRecordRepository extends JpaRepository<InjuryRecord, Long> {
    List<InjuryRecord> findByUserIdOrderByStartDateDesc(Long userId);
    List<InjuryRecord> findByUserIdAndStatus(Long userId, String status);
}
