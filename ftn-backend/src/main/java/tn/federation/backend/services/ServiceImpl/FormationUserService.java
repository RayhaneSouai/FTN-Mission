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
import tn.federation.backend.services.Abstraction.IEmailService;

import java.util.List;

@Service
public class FormationUserService {
    private final FormationProgramRepository programRepository;
    private final FormationRegistrationRepository registrationRepository;
    private final FormationCertificateRepository certificateRepository;
    private final UserRepository userRepository;
    private final IEmailService emailService;

    public FormationUserService(
            FormationProgramRepository programRepository,
            FormationRegistrationRepository registrationRepository,
            FormationCertificateRepository certificateRepository,
            UserRepository userRepository,
            IEmailService emailService) {
        this.programRepository = programRepository;
        this.registrationRepository = registrationRepository;
        this.certificateRepository = certificateRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
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
        FormationRegistration saved = registrationRepository.save(registration);
        notifyAdminNewRegistration(swimmer, program);
        return FormationRegistrationDTO.fromEntity(saved);
    }

    private void notifyAdminNewRegistration(User swimmer, FormationProgram program) {
        try {
            String swimmerName = swimmer.getFirstName() + " " + swimmer.getLastName();
            String brevet = program.getBrevetType() != null ? program.getBrevetType().name() : "—";
            emailService.sendFormationRegistrationPendingAdmin(
                    swimmerName.trim(),
                    swimmer.getEmail(),
                    program.getTitle(),
                    brevet
            );
        } catch (Exception ignored) {
            // Registration must succeed even if email fails (MailDev may be offline in dev)
        }
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
                .map(cert -> {
                    Long registrationId = registrationRepository
                            .findByProgram_IdAndSwimmer_Id(cert.getProgram().getId(), swimmer.getId())
                            .map(FormationRegistration::getId)
                            .orElse(null);
                    return FormationCertificateDTO.fromEntity(cert, registrationId);
                })
                .toList();
    }

    public FormationCertificateDTO verifyCertificate(String code) {
        FormationCertificate certificate = certificateRepository.findByVerificationCode(code)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Certificat introuvable"));
        return FormationCertificateDTO.fromEntity(certificate);
    }

    // ─── Admin registration workflow ─────────────────────────────────────────────

    public List<FormationRegistrationDTO> listForAdmin(Long seasonId, FormationRegistrationStatus status) {
        List<FormationRegistration> registrations;
        if (seasonId != null && status != null) {
            registrations = registrationRepository.findByProgram_Season_IdAndStatusOrderByRegisteredAtDesc(seasonId, status);
        } else if (seasonId != null) {
            registrations = registrationRepository.findByProgram_Season_IdOrderByRegisteredAtDesc(seasonId);
        } else if (status != null) {
            registrations = registrationRepository.findByStatusOrderByRegisteredAtDesc(status);
        } else {
            registrations = registrationRepository.findAllByOrderByRegisteredAtDesc();
        }
        return registrations.stream().map(FormationRegistrationDTO::fromEntity).toList();
    }

    @Transactional
    public FormationRegistrationDTO approveRegistration(Long registrationId) {
        FormationRegistration registration = requireRegistration(registrationId);
        registration.setStatus(FormationRegistrationStatus.APPROVED);
        registration.setDecisionNote("Inscription approuvée par l'administration.");
        return FormationRegistrationDTO.fromEntity(registrationRepository.save(registration));
    }

    @Transactional
    public FormationRegistrationDTO rejectRegistration(Long registrationId, String reason) {
        FormationRegistration registration = requireRegistration(registrationId);
        registration.setStatus(FormationRegistrationStatus.REJECTED);
        registration.setDecisionNote(reason != null && !reason.isBlank() ? reason : "Inscription refusée par l'administration.");
        return FormationRegistrationDTO.fromEntity(registrationRepository.save(registration));
    }

    @Transactional
    public FormationRegistrationDTO waitlistRegistration(Long registrationId) {
        FormationRegistration registration = requireRegistration(registrationId);
        registration.setStatus(FormationRegistrationStatus.WAITING_LIST);
        registration.setDecisionNote("Inscription placée en liste d'attente.");
        return FormationRegistrationDTO.fromEntity(registrationRepository.save(registration));
    }

    private FormationRegistration requireRegistration(Long registrationId) {
        return registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inscription introuvable"));
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
        java.time.LocalDate today = java.time.LocalDate.now();
        if (program.getRegistrationStartDate() != null && today.isBefore(program.getRegistrationStartDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Les inscriptions ne sont pas encore ouvertes pour cette formation");
        }
        if (program.getRegistrationEndDate() != null && today.isAfter(program.getRegistrationEndDate())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La période d'inscription pour cette formation est terminée");
        }
    }
}
