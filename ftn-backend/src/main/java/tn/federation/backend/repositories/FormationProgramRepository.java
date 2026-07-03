package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.federation.backend.entities.BrevetType;
import tn.federation.backend.entities.FormationProgram;
import tn.federation.backend.entities.FormationProgramStatus;
import tn.federation.backend.entities.ProgramType;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface FormationProgramRepository extends JpaRepository<FormationProgram, Long> {

    // ─── Existing method ───────────────────────────────────────────────────────────

    List<FormationProgram> findBySeason_IdOrderByCreatedAtDesc(Long seasonId);

    // ─── New keyword methods ───────────────────────────────────────────────────────

    // 1. Programs by publication status (DRAFT / PUBLISHED)
    List<FormationProgram> findByStatus(FormationProgramStatus status);

    // 2. Programs by brevet type (BF1 / BF2)
    List<FormationProgram> findByBrevetType(BrevetType brevetType);

    // 3. Programs by season id (no ordering — use findBySeason_IdOrderByCreatedAtDesc for ordered)
    List<FormationProgram> findBySeason_Id(Long seasonId);

    // 4. Programs with registration still open (registrationEndDate >= supplied date)
    List<FormationProgram> findByRegistrationEndDateGreaterThanEqual(LocalDate today);

    // ─── New JPQL queries ──────────────────────────────────────────────────────────

    // 5. Programs where a specific swimmer already has a registration entry
    @Query("SELECT fp FROM FormationProgram fp " +
           "WHERE fp.id IN (" +
           "  SELECT fr.program.id FROM FormationRegistration fr " +
           "  WHERE fr.swimmer.id = :swimmerId" +
           ")")
    List<FormationProgram> findProgramsAlreadyJoinedBySwimmer(@Param("swimmerId") Long swimmerId);

    // 6. Published programs with open registration whose conditions mention the swimmer's niveau.
    // 'role' is available at the service layer to decide if the caller is a swimmer or coach;
    // FormationProgram stores no role field, so it is not filtered here.
    @Query("SELECT fp FROM FormationProgram fp " +
           "WHERE fp.status = tn.federation.backend.entities.FormationProgramStatus.PUBLISHED " +
           "AND fp.registrationEndDate >= CURRENT_DATE " +
           "AND (fp.registrationConditions IS NULL " +
           "     OR LOWER(fp.registrationConditions) LIKE LOWER(CONCAT('%', :niveau, '%')))")
    List<FormationProgram> findEligiblePrograms(@Param("niveau") String niveau);

    // 7. Registration count per program — returns [programId, programTitle, registrationCount]
    @Query("SELECT fp.id, fp.title, " +
           "(SELECT COUNT(fr) FROM FormationRegistration fr WHERE fr.program = fp) " +
           "FROM FormationProgram fp " +
           "ORDER BY 3 DESC")
    List<Object[]> countRegistrationsPerProgram();

    // ─── Program type filtering (swimmer training vs. coach certification) ─────────

    List<FormationProgram> findByProgramTypeOrderByCreatedAtDesc(ProgramType programType);

    List<FormationProgram> findByProgramTypeAndSeason_IdOrderByCreatedAtDesc(ProgramType programType, Long seasonId);
}
