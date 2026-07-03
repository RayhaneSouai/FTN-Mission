package tn.federation.backend.services.ServiceImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.federation.backend.dto.ClubJoinPreviewDTO;
import tn.federation.backend.dto.ClubJoinRequestBody;
import tn.federation.backend.dto.ClubJoinRequestDTO;
import tn.federation.backend.dto.ClubRequirementItem;
import tn.federation.backend.entities.*;
import tn.federation.backend.repositories.ClubJoinRequestRepository;
import tn.federation.backend.repositories.ClubRepository;
import tn.federation.backend.repositories.UserRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.ArrayList;
import java.util.List;

@Service
public class ClubJoinRequestService {

    @Autowired
    private ClubJoinRequestRepository repository;

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private UserRepository userRepository;

    public ClubJoinPreviewDTO previewJoinRequest(Long swimmerId, Long clubId, String submittedLevel) {
        User swimmer = userRepository.findById(swimmerId)
                .orElseThrow(() -> new IllegalArgumentException("Nageur introuvable"));
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new IllegalArgumentException("Club introuvable"));
        return toPreview(evaluate(swimmer, club, submittedLevel));
    }

    @Transactional
    public ClubJoinRequestDTO processJoinRequest(Long swimmerId, Long clubId, ClubJoinRequestBody body) {
        User swimmer = userRepository.findById(swimmerId)
                .orElseThrow(() -> new IllegalArgumentException("Nageur introuvable"));
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new IllegalArgumentException("Club introuvable"));

        if (swimmer.getRole() != Role.SWIMMER) {
            throw new IllegalArgumentException("Seuls les nageurs peuvent demander à rejoindre un club.");
        }
        if (swimmer.getClub() != null) {
            throw new IllegalArgumentException("Vous êtes déjà affilié(e) à un club.");
        }
        if (repository.findBySwimmer_IdAndClub_IdAndStatus(
                swimmerId, clubId, ClubJoinRequestStatus.PENDING).isPresent()) {
            throw new IllegalArgumentException("Vous avez déjà une demande en attente pour ce club.");
        }
        if (repository.existsBySwimmer_IdAndStatus(swimmerId, ClubJoinRequestStatus.PENDING)) {
            throw new IllegalArgumentException(
                    "Vous avez déjà une demande d'adhésion en attente pour un autre club.");
        }

        ClubJoinRequest joinRequest = new ClubJoinRequest();
        joinRequest.setSwimmer(swimmer);
        joinRequest.setClub(club);
        String submittedLevel = null;
        if (body != null) {
            joinRequest.setMessage(body.message());
            joinRequest.setMotivationLetter(body.motivationLetter());
            joinRequest.setCurrentLevel(body.currentLevel());
            joinRequest.setPreviousClub(body.previousClub());
            joinRequest.setAvailability(body.availability());
            submittedLevel = body.currentLevel();
        }

        EvaluationResult result = evaluate(swimmer, club, submittedLevel);
        joinRequest.setStatus(result.status());
        joinRequest.setRejectionReason(result.reason());
        joinRequest.setCriteriaMet(result.criteriaMet());
        joinRequest.setCriteriaTotal(result.criteriaTotal());
        joinRequest.setEligibilityScore(result.eligibilityScore());

        if (result.status() == ClubJoinRequestStatus.APPROVED) {
            swimmer.setClub(club);
            userRepository.save(swimmer);
            joinRequest.setReviewedAt(LocalDateTime.now());
        }

        return ClubJoinRequestDTO.fromEntity(repository.save(joinRequest));
    }

    private record EvaluationResult(
            ClubJoinRequestStatus status,
            String reason,
            int criteriaMet,
            int criteriaTotal,
            int eligibilityScore,
            List<ClubRequirementItem> requirements
    ) {}

    private ClubJoinPreviewDTO toPreview(EvaluationResult result) {
        String label = switch (result.status()) {
            case APPROVED -> "Acceptation automatique probable";
            case PENDING -> "Liste d'attente / validation manuelle";
            case REJECTED -> "Non éligible actuellement";
            default -> "À vérifier";
        };
        String summary = switch (result.status()) {
            case APPROVED -> "Vous remplissez les critères principaux. Votre demande pourra être acceptée directement.";
            case PENDING -> "Certains critères nécessitent une validation par le club ou un document.";
            case REJECTED -> result.reason() != null ? result.reason() : "Les critères du club ne sont pas remplis.";
            default -> "";
        };
        return new ClubJoinPreviewDTO(
                result.requirements(),
                result.criteriaMet(),
                result.criteriaTotal(),
                result.eligibilityScore(),
                result.status().name(),
                label,
                summary
        );
    }

    private EvaluationResult evaluate(User swimmer, Club club, String submittedLevel) {
        List<ClubRequirementItem> requirements = new ArrayList<>();
        List<String> unmet = new ArrayList<>();

        int capacity = (club.getAvailableSpots() != null) ? club.getAvailableSpots() : club.getMaxCapacity();
        long currentMembers = userRepository.countByClub_Id(club.getId());
        boolean capacityOk = capacity <= 0 || currentMembers < capacity;
        requirements.add(new ClubRequirementItem(
                "capacity",
                "Places disponibles",
                capacity > 0 ? (capacity - currentMembers) + " place(s)" : "Illimitée",
                currentMembers + " nageur(s) inscrit(s)",
                capacityOk,
                false
        ));
        if (!capacityOk) {
            unmet.add("Aucune place disponible actuellement (capacité : " + capacity + ").");
        }

        int total = 0;
        int met = 0;

        if (club.getMinAge() != null || club.getMaxAge() != null) {
            int age = computeAge(swimmer.getBirthDate());
            if (club.getMinAge() != null) {
                total++;
                boolean ok = age >= 0 && age >= club.getMinAge();
                if (ok) met++;
                else unmet.add("âge minimum requis : " + club.getMinAge() + " ans");
                requirements.add(new ClubRequirementItem(
                        "minAge",
                        "Âge minimum",
                        club.getMinAge() + " ans",
                        age >= 0 ? age + " ans" : "Non renseigné",
                        ok,
                        false
                ));
            }
            if (club.getMaxAge() != null) {
                total++;
                boolean ok = age >= 0 && age <= club.getMaxAge();
                if (ok) met++;
                else unmet.add("âge maximum autorisé : " + club.getMaxAge() + " ans");
                requirements.add(new ClubRequirementItem(
                        "maxAge",
                        "Âge maximum",
                        club.getMaxAge() + " ans",
                        age >= 0 ? age + " ans" : "Non renseigné",
                        ok,
                        false
                ));
            }
        }

        if (club.getRequiredLevel() != null) {
            total++;
            Niveau effectiveLevel = resolveLevel(swimmer, submittedLevel);
            boolean ok = effectiveLevel != null
                    && effectiveLevel.ordinal() >= club.getRequiredLevel().ordinal();
            if (ok) met++;
            else {
                String label = effectiveLevel != null ? effectiveLevel.name() : "non renseigné";
                unmet.add("niveau requis : " + club.getRequiredLevel().name() + " (votre niveau : " + label + ")");
            }
            requirements.add(new ClubRequirementItem(
                    "level",
                    "Niveau requis",
                    club.getRequiredLevel().name() + " ou supérieur",
                    effectiveLevel != null ? effectiveLevel.name() : "Non renseigné",
                    ok,
                    false
            ));
        }

        if (club.getRequiredDiscipline() != null) {
            total++;
            boolean ok = club.getRequiredDiscipline() == swimmer.getDiscipline();
            if (ok) met++;
            else unmet.add("discipline requise : " + club.getRequiredDiscipline().name());
            requirements.add(new ClubRequirementItem(
                    "discipline",
                    "Discipline",
                    club.getRequiredDiscipline().name(),
                    swimmer.getDiscipline() != null ? swimmer.getDiscipline().name() : "Non renseignée",
                    ok,
                    false
            ));
        }

        if (club.isMedicalCertificateRequired()) {
            requirements.add(new ClubRequirementItem(
                    "medical",
                    "Certificat médical",
                    "Requis",
                    "À vérifier par le club",
                    false,
                    true
            ));
        }

        if (requirements.stream().noneMatch(r -> !"capacity".equals(r.key()))) {
            requirements.add(0, new ClubRequirementItem(
                    "open",
                    "Critères d'adhésion",
                    "Aucune exigence spécifique",
                    "Admission ouverte",
                    true,
                    false
            ));
        }

        ClubJoinRequestStatus status;
        String reason = null;

        if (!capacityOk) {
            status = ClubJoinRequestStatus.REJECTED;
            reason = unmet.get(0);
        } else if (total == 0 || met == total) {
            status = ClubJoinRequestStatus.APPROVED;
        } else if (met == 0) {
            status = ClubJoinRequestStatus.REJECTED;
            reason = "Critères non satisfaits : " + String.join("; ", unmet);
        } else {
            status = ClubJoinRequestStatus.PENDING;
        }

        if (club.isMedicalCertificateRequired() && status == ClubJoinRequestStatus.APPROVED) {
            status = ClubJoinRequestStatus.PENDING;
        }

        int score = total == 0 ? 100 : (int) Math.round((met * 100.0) / total);

        return new EvaluationResult(status, reason, met, total, score, requirements);
    }

    private Niveau resolveLevel(User swimmer, String submittedLevel) {
        if (submittedLevel != null && !submittedLevel.isBlank()) {
            try {
                return Niveau.valueOf(submittedLevel.trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {
                // fall back to profile
            }
        }
        return swimmer.getNiveau();
    }

    private int computeAge(LocalDate birthDate) {
        if (birthDate == null) return -1;
        return Period.between(birthDate, LocalDate.now()).getYears();
    }
}
