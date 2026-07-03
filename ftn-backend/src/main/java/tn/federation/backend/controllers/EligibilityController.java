package tn.federation.backend.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import tn.federation.backend.dto.AiEligibilityResponse;
import tn.federation.backend.dto.FormationProgramDTO;
import tn.federation.backend.dto.UserDTO;
import tn.federation.backend.entities.FormationCertificate;
import tn.federation.backend.entities.FormationProgram;
import tn.federation.backend.entities.User;
import tn.federation.backend.repositories.FormationCertificateRepository;
import tn.federation.backend.repositories.FormationProgramRepository;
import tn.federation.backend.repositories.FormationRegistrationRepository;
import tn.federation.backend.repositories.UserRepository;
import tn.federation.backend.services.ServiceImpl.AiService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/formation")
public class EligibilityController {

    private final AiService aiService;
    private final UserRepository userRepository;
    private final FormationProgramRepository programRepository;
    private final FormationCertificateRepository certificateRepository;
    private final FormationRegistrationRepository registrationRepository;

    public EligibilityController(
            AiService aiService,
            UserRepository userRepository,
            FormationProgramRepository programRepository,
            FormationCertificateRepository certificateRepository,
            FormationRegistrationRepository registrationRepository) {
        this.aiService = aiService;
        this.userRepository = userRepository;
        this.programRepository = programRepository;
        this.certificateRepository = certificateRepository;
        this.registrationRepository = registrationRepository;
    }

    /**
     * POST /api/formation/check-eligibility
     * Body: { "swimmerId": 1, "programId": 2 }
     * Returns: { "eligible": true/false, "message": "..." }
     */
    @PostMapping("/check-eligibility")
    @PreAuthorize("hasAnyRole('SWIMMER', 'COACH', 'ADMIN')")
    public ResponseEntity<AiEligibilityResponse> checkEligibility(
            @RequestBody EligibilityRequest request) {

        User user = userRepository.findById(request.swimmerId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Nageur introuvable"));

        FormationProgram program = programRepository.findById(request.programId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Formation introuvable"));

        UserDTO swimmerDTO = toUserDTO(user, request.swimmerId());
        FormationProgramDTO programDTO = toProgramDTO(program);

        return ResponseEntity.ok(aiService.checkEligibility(swimmerDTO, programDTO));
    }

    // ─── DTO builders ────────────────────────────────────────────────────────────

    private UserDTO toUserDTO(User user, Long swimmerId) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setActive(user.getActive());
        dto.setBirthDate(user.getBirthDate());
        dto.setNiveau(user.getNiveau() != null ? user.getNiveau().name() : null);
        dto.setDiscipline(user.getDiscipline() != null ? user.getDiscipline().name() : null);
        dto.setAnciennete(user.getAnciennete());

        // Certifications: brevet type names from awarded certificates
        List<FormationCertificate> certs = certificateRepository.findBySwimmer_IdOrderByIssuedAtDesc(swimmerId);
        List<String> certNames = certs.stream()
                .filter(c -> c.isDownloadable())
                .map(c -> c.getProgram() != null && c.getProgram().getBrevetType() != null
                        ? c.getProgram().getBrevetType().name() : "Brevet")
                .collect(Collectors.toList());
        dto.setCertifications(certNames);

        // Licence active: proxy — user is active and assigned to a club
        boolean hasClub = user.getClub() != null;
        boolean isActive = Boolean.TRUE.equals(user.getActive());
        dto.setLicenceActive(isActive && hasClub ? "Oui" : "Non");

        return dto;
    }

    private FormationProgramDTO toProgramDTO(FormationProgram program) {
        long registered = registrationRepository.countByProgram_Id(program.getId());
        // Default capacity 50 if no explicit limit is stored on the program
        int spotsAvailable = (int) Math.max(0, 50 - registered);

        return FormationProgramDTO.builder()
                .id(program.getId())
                .title(program.getTitle())
                .brevetType(program.getBrevetType() != null ? program.getBrevetType().name() : null)
                .registrationConditions(program.getRegistrationConditions())
                .registrationFee(program.getRegistrationFee())
                .spotsAvailable(spotsAvailable)
                .build();
    }

    // ─── Request record ──────────────────────────────────────────────────────────

    public record EligibilityRequest(Long swimmerId, Long programId) {}
}
