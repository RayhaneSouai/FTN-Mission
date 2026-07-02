package tn.federation.backend.services.ServiceImpl;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import tn.federation.backend.dto.FormationCertificateDTO;
import tn.federation.backend.dto.FormationRegistrationDTO;
import tn.federation.backend.entities.FormationCertificate;
import tn.federation.backend.entities.FormationProgram;
import tn.federation.backend.entities.FormationProgramStatus;
import tn.federation.backend.entities.FormationRegistration;
import tn.federation.backend.entities.FormationRegistrationStatus;
import tn.federation.backend.entities.Role;
import tn.federation.backend.entities.User;
import tn.federation.backend.repositories.FormationCertificateRepository;
import tn.federation.backend.repositories.FormationProgramRepository;
import tn.federation.backend.repositories.FormationRegistrationRepository;
import tn.federation.backend.repositories.UserRepository;

import java.util.List;

@Service
public class FormationUserService {
    private final FormationProgramRepository programRepository;
    private final FormationRegistrationRepository registrationRepository;
    private final FormationCertificateRepository certificateRepository;
    private final UserRepository userRepository;

    public FormationUserService(
            FormationProgramRepository programRepository,
            FormationRegistrationRepository registrationRepository,
            FormationCertificateRepository certificateRepository,
            UserRepository userRepository) {
        this.programRepository = programRepository;
        this.registrationRepository = registrationRepository;
        this.certificateRepository = certificateRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public FormationRegistrationDTO register(Long programId, String swimmerEmail) {
        User swimmer = resolveSwimmer(swimmerEmail);
        FormationProgram program = programRepository.findById(programId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Formation introuvable"));

        validateRegistrationIsOpen(program);

        FormationRegistration registration = registrationRepository
                .findByProgram_IdAndSwimmer_Id(program.getId(), swimmer.getId())
                .orElseGet(FormationRegistration::new);

        if (registration.getId() != null) {
            return FormationRegistrationDTO.fromEntity(registration);
        }

        registration.setProgram(program);
        registration.setSwimmer(swimmer);
        registration.setStatus(FormationRegistrationStatus.PENDING);
        registration.setEligibilityNote("Demande reçue. Elle sera vérifiée par l'administration.");
        return FormationRegistrationDTO.fromEntity(registrationRepository.save(registration));
    }

    public List<FormationRegistrationDTO> findMyRegistrations(String swimmerEmail) {
        User swimmer = resolveSwimmer(swimmerEmail);
        return registrationRepository.findBySwimmer_IdOrderByRegisteredAtDesc(swimmer.getId())
                .stream()
                .map(FormationRegistrationDTO::fromEntity)
                .toList();
    }

    public List<FormationRegistrationDTO> findMyHistory(String swimmerEmail) {
        return findMyRegistrations(swimmerEmail).stream()
                .filter(item -> "COMPLETED".equals(item.phase()))
                .toList();
    }

    public List<FormationCertificateDTO> findMyCertificates(String swimmerEmail) {
        User swimmer = resolveSwimmer(swimmerEmail);
        return certificateRepository.findBySwimmer_IdOrderByIssuedAtDesc(swimmer.getId())
                .stream()
                .map(FormationCertificateDTO::fromEntity)
                .toList();
    }

    public FormationCertificateDTO verifyCertificate(String code) {
        FormationCertificate certificate = certificateRepository.findByVerificationCode(code)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Certificat introuvable"));
        return FormationCertificateDTO.fromEntity(certificate);
    }

    private User resolveSwimmer(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur introuvable"));
        if (user.getRole() != Role.SWIMMER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cette action est réservée aux nageurs");
        }
        return user;
    }

    private void validateRegistrationIsOpen(FormationProgram program) {
        if (program.getStatus() != FormationProgramStatus.PUBLISHED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cette formation n'est pas ouverte au public");
        }
        if (program.getSeason() == null || !program.getSeason().isActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Les inscriptions sont désactivées pour les saisons archivées");
        }
    }
}
