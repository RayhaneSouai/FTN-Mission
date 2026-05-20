package tn.federation.backend.services.ServiceImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.federation.backend.dto.EligibilityDTO;
import tn.federation.backend.dto.EngagementRequestDTO;
import tn.federation.backend.dto.EngagementResponseDTO;
import tn.federation.backend.entities.*;
import tn.federation.backend.exceptions.ProgrammeValidationException;
import tn.federation.backend.repositories.*;
import tn.federation.backend.services.Abstraction.IEngagementService;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EngagementServiceImpl implements IEngagementService {

    private static final int MAX_INDIVIDUAL_EVENTS = 5;

    @Autowired
    private EngagementRepository engagementRepository;

    @Autowired
    private CompetitionRepository competitionRepository;

    @Autowired
    private CompetitionEventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PerformanceRepository performanceRepository;

    // ═══════════════════════════════════════════════════════
    // ═══════════ DEMANDE D'ENGAGEMENT ════════════════════
    // ═══════════════════════════════════════════════════════

    @Override
    @Transactional
    public EngagementResponseDTO requestEngagement(String swimmerEmail, Long competitionId,
            EngagementRequestDTO request) {
        User swimmer = findSwimmerByEmail(swimmerEmail);
        Competition competition = findCompetition(competitionId);
        CompetitionEvent event = findEvent(request.eventId());

        // Vérifier que l'épreuve appartient bien à cette compétition
        if (!event.getDay().getCompetition().getId().equals(competitionId)) {
            throw new ProgrammeValidationException("L'épreuve ne fait pas partie de cette compétition.");
        }

        // Vérifier pas déjà engagé sur cette épreuve
        Optional<Engagement> existing = engagementRepository.findBySwimmerIdAndEventId(swimmer.getId(), event.getId());
        if (existing.isPresent()) {
            EngagementStatus existingStatus = existing.get().getStatus();
            if (existingStatus != EngagementStatus.REFUSEE) {
                throw new ProgrammeValidationException("Vous êtes déjà engagé(e) sur cette épreuve.");
            }
        }

        // Valider les règles FTN
        List<String> violations = checkFtnRules(swimmer, competition, event);
        if (!violations.isEmpty()) {
            throw new ProgrammeValidationException(
                    "Engagement non autorisé : " + String.join(" ; ", violations));
        }

        Engagement engagement = new Engagement();
        engagement.setSwimmer(swimmer);
        engagement.setEvent(event);
        engagement.setCompetition(competition);
        engagement.setClub(swimmer.getClub());
        engagement.setEntryTime(request.entryTime());
        engagement.setStatus(EngagementStatus.DEMANDE);
        engagement.setRequestedAt(LocalDateTime.now());

        engagement = engagementRepository.save(engagement);
        return mapToResponse(engagement);
    }

    // ═══════════════════════════════════════════════════════
    // ═══════════ VÉRIFICATION D'ÉLIGIBILITÉ ═════════════
    // ═══════════════════════════════════════════════════════

    @Override
    @Transactional(readOnly = true)
    public List<EligibilityDTO> checkEligibility(String swimmerEmail, Long competitionId) {
        User swimmer = findSwimmerByEmail(swimmerEmail);
        Competition competition = findCompetition(competitionId);

        // Récupérer toutes les épreuves de la compétition
        List<CompetitionEvent> events = getCompetitionEvents(competitionId);

        return events.stream()
                .map(event -> {
                    List<String> reasons = checkFtnRules(swimmer, competition, event);
                    return new EligibilityDTO(
                            event.getId(),
                            event.getEventName(),
                            reasons.isEmpty(),
                            reasons);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public EligibilityDTO checkEventEligibility(String swimmerEmail, Long competitionId, Long eventId) {
        User swimmer = findSwimmerByEmail(swimmerEmail);
        Competition competition = findCompetition(competitionId);
        CompetitionEvent event = findEvent(eventId);

        List<String> reasons = checkFtnRules(swimmer, competition, event);
        return new EligibilityDTO(event.getId(), event.getEventName(), reasons.isEmpty(), reasons);
    }

    // ═══════════════════════════════════════════════════════
    // ═══════════ LECTURE ═════════════════════════════════
    // ═══════════════════════════════════════════════════════

    @Override
    @Transactional(readOnly = true)
    public List<EngagementResponseDTO> getSwimmerEngagements(String swimmerEmail, Long competitionId) {
        User swimmer = findSwimmerByEmail(swimmerEmail);
        return engagementRepository.findBySwimmerIdAndCompetitionId(swimmer.getId(), competitionId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EngagementResponseDTO> getCompetitionEngagements(Long competitionId) {
        return engagementRepository.findByCompetitionId(competitionId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EngagementResponseDTO> getClubEngagements(Long clubId, Long competitionId) {
        return engagementRepository.findByClubIdAndCompetitionId(clubId, competitionId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    // ═══════════════════════════════════════════════════════
    // ═══════════ VALIDATION CLUB ═════════════════════════
    // ═══════════════════════════════════════════════════════

    @Override
    @Transactional
    public EngagementResponseDTO validateEngagement(Long engagementId) {
        Engagement engagement = findEngagement(engagementId);
        if (engagement.getStatus() != EngagementStatus.DEMANDE) {
            throw new ProgrammeValidationException(
                    "Seuls les engagements en statut DEMANDE peuvent être validés par le club.");
        }
        engagement.setStatus(EngagementStatus.VALIDEE_CLUB);
        engagement.setValidatedAt(LocalDateTime.now());
        engagementRepository.save(engagement);
        return mapToResponse(engagement);
    }

    @Override
    @Transactional
    public EngagementResponseDTO rejectEngagement(Long engagementId, String reason) {
        Engagement engagement = findEngagement(engagementId);
        if (engagement.getStatus() == EngagementStatus.CONFIRMEE) {
            throw new ProgrammeValidationException("Un engagement confirmé ne peut plus être refusé.");
        }
        engagement.setStatus(EngagementStatus.REFUSEE);
        engagement.setRejectionReason(reason);
        engagement.setValidatedAt(LocalDateTime.now());
        engagementRepository.save(engagement);
        return mapToResponse(engagement);
    }

    // ═══════════════════════════════════════════════════════
    // ═══════════ CONFIRMATION ADMIN ═════════════════════
    // ═══════════════════════════════════════════════════════

    @Override
    @Transactional
    public EngagementResponseDTO confirmEngagement(Long engagementId) {
        Engagement engagement = findEngagement(engagementId);
        if (engagement.getStatus() != EngagementStatus.VALIDEE_CLUB) {
            throw new ProgrammeValidationException(
                    "Seuls les engagements validés par le club peuvent être confirmés.");
        }
        engagement.setStatus(EngagementStatus.CONFIRMEE);
        engagement.setValidatedAt(LocalDateTime.now());
        engagementRepository.save(engagement);
        return mapToResponse(engagement);
    }

    // ═══════════════════════════════════════════════════════
    // ═══════════ RÈGLES FTN ═════════════════════════════
    // ═══════════════════════════════════════════════════════

    private List<String> checkFtnRules(User swimmer, Competition competition, CompetitionEvent event) {
        List<String> violations = new ArrayList<>();

        // 1. Vérification du genre
        if (event.getGender() != null && swimmer.getGender() != null
                && event.getGender() != swimmer.getGender()) {
            String required = event.getGender() == Gender.HOMME ? "Messieurs" : "Dames";
            violations.add("Épreuve réservée aux " + required);
        }

        // 2. Vérification de la catégorie d'âge
        if (event.getRequiredAgeCategory() != null
                && event.getRequiredAgeCategory() != AgeCategory.TC) {
            if (swimmer.getBirthDate() == null) {
                violations.add("Date de naissance non renseignée – impossible de vérifier la catégorie");
            } else if (!event.getRequiredAgeCategory().isEligible(
                    swimmer.getBirthDate(), competition.getStartDate())) {
                AgeCategory swimmerCat = AgeCategory.fromBirthDate(
                        swimmer.getBirthDate(), competition.getStartDate());
                String swimmerLabel = swimmerCat != null ? swimmerCat.getLabel() : "inconnue";
                violations.add("Catégorie requise : " + event.getRequiredAgeCategory().getLabel()
                        + " (votre catégorie : " + swimmerLabel + ")");
            }
        }

        // 3. Vérification du temps minima
        if (event.getMinimaTime() != null) {
            Double bestTime = findBestTime(swimmer, event.getDistance(), event.getStroke());
            if (bestTime == null) {
                violations.add("Aucun temps de référence enregistré pour cette distance/nage");
            } else if (bestTime > event.getMinimaTime()) {
                violations.add(String.format(
                        "Temps minima requis : %.2fs (votre meilleur temps : %.2fs)",
                        event.getMinimaTime(), bestTime));
            }
        }

        // 4. Vérification de la limite de 5 épreuves individuelles
        long activeEngagements = engagementRepository.countBySwimmerAndCompetitionExcludingStatus(
                swimmer.getId(), competition.getId(), EngagementStatus.REFUSEE);
        if (activeEngagements >= MAX_INDIVIDUAL_EVENTS) {
            violations.add("Limite de " + MAX_INDIVIDUAL_EVENTS
                    + " épreuves individuelles atteinte pour cette compétition");
        }

        // 5. Vérification du club (un nageur doit avoir un club)
        if (swimmer.getClub() == null) {
            violations.add("Vous devez être affilié(e) à un club pour vous engager");
        }

        return violations;
    }

    /**
     * Recherche le meilleur temps du nageur pour une distance et une nage données.
     */
    private Double findBestTime(User swimmer, String distance, String stroke) {
        List<Performance> performances = performanceRepository.findBySwimmerIdOrderByDateAsc(swimmer.getId());
        if (performances == null || performances.isEmpty())
            return null;

        Integer targetDistance = parseDistance(distance);
        StrokeType targetStroke = mapStroke(stroke);

        return performances.stream()
                .filter(p -> p.getDistance() != null && p.getStroke() != null && p.getTime() != null)
                .filter(p -> p.getDistance().equals(targetDistance))
                .filter(p -> targetStroke == null || p.getStroke() == targetStroke)
                .map(Performance::getTime)
                .min(Double::compareTo)
                .orElse(null);
    }

    private Integer parseDistance(String distance) {
        if (distance == null)
            return null;
        String cleaned = distance.replaceAll("[^0-9]", "");
        try {
            return Integer.parseInt(cleaned);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private StrokeType mapStroke(String stroke) {
        if (stroke == null)
            return null;
        String upper = stroke.toUpperCase().trim();
        return switch (upper) {
            case "DOS" -> StrokeType.DOS;
            case "BRASSE" -> StrokeType.BRASSE;
            case "PAPILLON" -> StrokeType.PAPILLON;
            case "NAGE LIBRE", "LIBRE", "NL" -> StrokeType.LIBRE;
            case "4 NAGES", "QUATRE NAGES", "4NAGES" -> StrokeType.QUATRE_NAGES;
            default -> null;
        };
    }

    // ═══════════════════════════════════════════════════════
    // ═══════════ HELPERS ════════════════════════════════
    // ═══════════════════════════════════════════════════════

    private User findSwimmerByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ProgrammeValidationException("Utilisateur introuvable."));
    }

    private Competition findCompetition(Long id) {
        return competitionRepository.findById(id)
                .orElseThrow(() -> new ProgrammeValidationException("Compétition introuvable : " + id));
    }

    private CompetitionEvent findEvent(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new ProgrammeValidationException("Épreuve introuvable : " + id));
    }

    private Engagement findEngagement(Long id) {
        return engagementRepository.findById(id)
                .orElseThrow(() -> new ProgrammeValidationException("Engagement introuvable : " + id));
    }

    private List<CompetitionEvent> getCompetitionEvents(Long competitionId) {
        return eventRepository.findByDayCompetitionId(competitionId);
    }

    private EngagementResponseDTO mapToResponse(Engagement e) {
        return new EngagementResponseDTO(
                e.getId(),
                e.getSwimmer().getId(),
                e.getSwimmer().getFirstName(),
                e.getSwimmer().getLastName(),
                e.getEvent().getId(),
                e.getEvent().getEventName(),
                e.getCompetition().getId(),
                e.getCompetition().getName(),
                e.getClub() != null ? e.getClub().getName() : null,
                e.getEntryTime(),
                e.getStatus().name(),
                e.getRequestedAt(),
                e.getValidatedAt(),
                e.getRejectionReason());
    }
}
