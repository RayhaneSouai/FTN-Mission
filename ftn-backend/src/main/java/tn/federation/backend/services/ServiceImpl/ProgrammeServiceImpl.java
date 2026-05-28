package tn.federation.backend.services.ServiceImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.federation.backend.dto.*;
import tn.federation.backend.entities.*;
import tn.federation.backend.exceptions.ProgrammeValidationException;
import tn.federation.backend.repositories.*;
import tn.federation.backend.services.Abstraction.IProgrammeService;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProgrammeServiceImpl implements IProgrammeService {

    @Autowired
    private CompetitionDayRepository dayRepository;

    @Autowired
    private CompetitionRepository competitionRepository;

    @Autowired
    private CompetitionEventRepository eventRepository;

    @Autowired
    private EventSeriesRepository seriesRepository;

    @Autowired
    private SeriesParticipantRepository participantRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProgramItemRepository programItemRepository;

    // ═══════════════════════════════════════════════════════
    // ═══════════ NEW API (flat ProgramItem) ══════════════
    // ═══════════════════════════════════════════════════════

    @Override
    @Transactional(readOnly = true)
    public ProgrammeStatusResponse getProgrammeStatus(Long competitionId) {
        Competition comp = findCompetition(competitionId);
        int totalDaysRequired = computeTotalDays(comp);
        List<CompetitionDay> days = dayRepository.findByCompetitionIdOrderByDayNumber(competitionId);
        List<ProgrammeDayResponse> dayResponses = days.stream().map(this::mapToDayResponse)
                .collect(Collectors.toList());
        boolean programGenerated = !days.isEmpty();
        String statusStr = comp.getProgrammeStatus() != null ? comp.getProgrammeStatus().name() : null;
        return new ProgrammeStatusResponse(competitionId, totalDaysRequired, days.size(), programGenerated,
                statusStr, dayResponses);
    }

    @Override
    @Transactional
    public ProgrammeStatusResponse generateProgramme(Long competitionId) {
        Competition comp = findCompetition(competitionId);

        List<CompetitionDay> existing = dayRepository.findByCompetitionIdOrderByDayNumber(competitionId);
        if (!existing.isEmpty()) {
            throw new ProgrammeValidationException("Le programme a déjà été généré pour cette compétition.");
        }

        if (comp.getStartDate() == null || comp.getEndDate() == null) {
            throw new ProgrammeValidationException("Les dates de la compétition ne sont pas définies.");
        }

        int totalDays = computeTotalDays(comp);
        LocalDate current = comp.getStartDate();

        for (int i = 1; i <= totalDays; i++) {
            CompetitionDay day = new CompetitionDay();
            day.setDayNumber(i);
            day.setDate(current);
            day.setCompetition(comp);
            dayRepository.save(day);
            current = current.plusDays(1);
        }

        // Default to DRAFT when programme is generated
        comp.setProgrammeStatus(ProgrammeStatus.DRAFT);
        competitionRepository.save(comp);

        return getProgrammeStatus(competitionId);
    }

    @Override
    @Transactional
    public ProgramItemResponse addProgramItem(Long dayId, ProgramItemRequest request) {
        CompetitionDay day = dayRepository.findById(dayId)
                .orElseThrow(() -> new ProgrammeValidationException("Jour introuvable: " + dayId));

        Competition competition = day.getCompetition();
        enforceEditableBeforeStartDate(competition);

        ProgramItemType type = parseType(request.type());

        if (type == ProgramItemType.SERIES
                && (request.numberOfParticipants() == null || request.numberOfParticipants() < 1)) {
            throw new ProgrammeValidationException("Le nombre de participants est obligatoire pour une série.");
        }

        // Validate single swimmer category for SERIES
        Categorie category = parseSwimmerCategory(type, request.swimmerCategory(), competition);

        // Chronological validation: new item must be after the latest existing item
        Optional<LocalTime> maxTime = programItemRepository.findMaxTimeByDayId(dayId);
        if (maxTime.isPresent() && !request.time().isAfter(maxTime.get())) {
            throw new ProgrammeValidationException(
                    "L'heure doit être postérieure au dernier élément du programme (" + maxTime.get() + ").");
        }

        ProgramItem item = new ProgramItem();
        item.setLabel(request.label());
        item.setTime(request.time());
        item.setType(type);
        item.setNumberOfParticipants(type == ProgramItemType.SERIES ? request.numberOfParticipants() : null);
        item.setSwimmerCategory(type == ProgramItemType.SERIES ? category : null);
        item.setSeriesGender(type == ProgramItemType.SERIES ? parseGender(request.seriesGender()) : null);
        item.setDay(day);

        item = programItemRepository.save(item);
        return mapToItemResponse(item);
    }

    @Override
    @Transactional
    public ProgramItemResponse updateProgramItem(Long itemId, ProgramItemRequest request) {
        ProgramItem item = programItemRepository.findById(itemId)
                .orElseThrow(() -> new ProgrammeValidationException("Élément introuvable: " + itemId));

        Competition competition = item.getDay().getCompetition();
        enforceEditableBeforeStartDate(competition);

        ProgramItemType type = parseType(request.type());

        if (type == ProgramItemType.SERIES
                && (request.numberOfParticipants() == null || request.numberOfParticipants() < 1)) {
            throw new ProgrammeValidationException("Le nombre de participants est obligatoire pour une série.");
        }

        // Validate single swimmer category for SERIES
        Categorie category = parseSwimmerCategory(type, request.swimmerCategory(), competition);

        // Chronological validation: updated time must be after the latest OTHER item in
        // this day
        Optional<LocalTime> maxTime = programItemRepository.findMaxTimeByDayIdExcluding(item.getDay().getId(), itemId);
        if (maxTime.isPresent() && !request.time().isAfter(maxTime.get())) {
            throw new ProgrammeValidationException(
                    "L'heure doit être postérieure au dernier élément du programme (" + maxTime.get() + ").");
        }

        item.setLabel(request.label());
        item.setTime(request.time());
        item.setType(type);
        item.setNumberOfParticipants(type == ProgramItemType.SERIES ? request.numberOfParticipants() : null);
        item.setSwimmerCategory(type == ProgramItemType.SERIES ? category : null);
        item.setSeriesGender(type == ProgramItemType.SERIES ? parseGender(request.seriesGender()) : null);

        programItemRepository.save(item);
        return mapToItemResponse(item);
    }

    @Override
    @Transactional
    public void deleteProgramItem(Long itemId) {
        ProgramItem item = programItemRepository.findById(itemId)
                .orElseThrow(() -> new ProgrammeValidationException("Élément introuvable: " + itemId));
        enforceEditableBeforeStartDate(item.getDay().getCompetition());
        programItemRepository.deleteById(itemId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProgramItemResponse> getSeriesItems(Long competitionId) {
        return programItemRepository.findByDayCompetitionIdAndType(competitionId, ProgramItemType.SERIES)
                .stream().map(this::mapToItemResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProgrammeStatusResponse approveProgramme(Long competitionId) {
        Competition comp = findCompetition(competitionId);
        if (comp.getProgrammeStatus() == null) {
            throw new ProgrammeValidationException("Aucun programme n'a été généré pour cette compétition.");
        }
        if (comp.getProgrammeStatus() == ProgrammeStatus.APPROVED) {
            throw new ProgrammeValidationException("Le programme est déjà approuvé.");
        }
        comp.setProgrammeStatus(ProgrammeStatus.APPROVED);
        competitionRepository.save(comp);
        return getProgrammeStatus(competitionId);
    }

    @Override
    @Transactional(readOnly = true)
    public ProgrammeStatusResponse getApprovedProgramme(Long competitionId) {
        Competition comp = findCompetition(competitionId);
        if (comp.getProgrammeStatus() != ProgrammeStatus.APPROVED) {
            // Return a response indicating no approved programme
            int totalDays = computeTotalDays(comp);
            return new ProgrammeStatusResponse(competitionId, totalDays, 0, false, null, List.of());
        }
        return getProgrammeStatus(competitionId);
    }

    // ─── Helpers ───

    private ProgramItemType parseType(String type) {
        try {
            return ProgramItemType.valueOf(type.toUpperCase());
        } catch (Exception e) {
            throw new ProgrammeValidationException("Type invalide: " + type + ". Valeurs possibles: PART, SERIES");
        }
    }

    private int computeTotalDays(Competition comp) {
        if (comp.getStartDate() == null || comp.getEndDate() == null)
            return 0;
        return (int) ChronoUnit.DAYS.between(comp.getStartDate(), comp.getEndDate()) + 1;
    }

    private Competition findCompetition(Long competitionId) {
        return competitionRepository.findById(competitionId)
                .orElseThrow(() -> new ProgrammeValidationException("Compétition introuvable: " + competitionId));
    }

    private ProgrammeDayResponse mapToDayResponse(CompetitionDay day) {
        List<ProgramItemResponse> items = day.getItems() != null
                ? day.getItems().stream().map(this::mapToItemResponse).collect(Collectors.toList())
                : List.of();
        return new ProgrammeDayResponse(day.getId(), day.getDayNumber(), day.getDate(), items);
    }

    private ProgramItemResponse mapToItemResponse(ProgramItem item) {
        String category = item.getSwimmerCategory() != null ? item.getSwimmerCategory().name() : null;
        String gender = item.getSeriesGender() != null ? item.getSeriesGender().name() : null;
        return new ProgramItemResponse(item.getId(), item.getLabel(), item.getTime(),
                item.getType().name(), item.getNumberOfParticipants(), category, gender);
    }

    /**
     * Validates that the selected category belongs to the competition's allowed
     * categories.
     */
    private Categorie parseSwimmerCategory(ProgramItemType type, String categoryName, Competition competition) {
        if (type != ProgramItemType.SERIES) {
            return null;
        }
        if (categoryName == null || categoryName.isBlank()) {
            throw new ProgrammeValidationException(
                    "La catégorie de nageur est obligatoire pour une série.");
        }
        Categorie category;
        try {
            category = Categorie.valueOf(categoryName.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ProgrammeValidationException("Catégorie invalide: " + categoryName);
        }
        // Validate category is in competition's allowed categories
        if (competition.getAllowedCategories() != null && !competition.getAllowedCategories().isEmpty()) {
            if (!competition.getAllowedCategories().contains(category)) {
                throw new ProgrammeValidationException(
                        "La catégorie « " + category.name() + " » n'est pas autorisée pour cette compétition.");
            }
        }
        return category;
    }

    /**
     * Parses the gender string for a series. Returns null for MIXTE.
     */
    private Gender parseGender(String genderName) {
        if (genderName == null || genderName.isBlank() || genderName.equalsIgnoreCase("MIXTE")) {
            return null;
        }
        try {
            return Gender.valueOf(genderName.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ProgrammeValidationException(
                    "Genre invalide: " + genderName + ". Valeurs possibles: HOMME, FEMME, MIXTE");
        }
    }

    /**
     * Prevents program modifications after competition start date.
     */
    private void enforceEditableBeforeStartDate(Competition competition) {
        if (competition.getStartDate() != null && !LocalDate.now().isBefore(competition.getStartDate())) {
            throw new ProgrammeValidationException(
                    "Le programme ne peut plus être modifié après la date de début de la compétition.");
        }
    }

    // ═══════════════════════════════════════════════════════
    // ═══════════ LEGACY API ══════════════════════════════
    // ═══════════════════════════════════════════════════════

    @Override
    @Transactional(readOnly = true)
    public List<ProgrammeDayDTO> getProgrammeByCompetitionId(Long competitionId) {
        List<CompetitionDay> days = dayRepository.findByCompetitionIdOrderByDayNumber(competitionId);
        return days.stream().map(this::mapDayToDTO).collect(Collectors.toList());
    }

    @Override
    public CompetitionDay addDay(Long competitionId, CompetitionDay day) {
        Competition competition = competitionRepository.findById(competitionId)
                .orElseThrow(() -> new RuntimeException("Competition not found: " + competitionId));
        day.setCompetition(competition);

        if (day.getEvents() != null) {
            for (CompetitionEvent event : day.getEvents()) {
                event.setDay(day);
                if (event.getSeries() != null) {
                    for (EventSeries series : event.getSeries()) {
                        series.setEvent(event);
                        if (series.getParticipants() != null) {
                            for (SeriesParticipant participant : series.getParticipants()) {
                                participant.setSeries(series);
                            }
                        }
                    }
                }
            }
        }

        return dayRepository.save(day);
    }

    @Override
    public CompetitionDay updateDay(Long dayId, CompetitionDay updated) {
        CompetitionDay day = dayRepository.findById(dayId)
                .orElseThrow(() -> new RuntimeException("Day not found: " + dayId));
        day.setDayNumber(updated.getDayNumber());
        day.setDate(updated.getDate());
        return dayRepository.save(day);
    }

    @Override
    public void deleteDay(Long dayId) {
        dayRepository.deleteById(dayId);
    }

    @Override
    public CompetitionEvent addEvent(Long dayId, CompetitionEvent event) {
        CompetitionDay day = dayRepository.findById(dayId)
                .orElseThrow(() -> new RuntimeException("Day not found: " + dayId));
        event.setDay(day);
        return eventRepository.save(event);
    }

    @Override
    public CompetitionEvent updateEvent(Long eventId, CompetitionEvent updated) {
        CompetitionEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found: " + eventId));
        event.setEventNumber(updated.getEventNumber());
        event.setEventName(updated.getEventName());
        event.setGender(updated.getGender());
        event.setDistance(updated.getDistance());
        event.setStroke(updated.getStroke());
        return eventRepository.save(event);
    }

    @Override
    public void deleteEvent(Long eventId) {
        eventRepository.deleteById(eventId);
    }

    @Override
    public EventSeries addSeries(Long eventId, EventSeries series) {
        CompetitionEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found: " + eventId));
        series.setEvent(event);
        return seriesRepository.save(series);
    }

    @Override
    public void deleteSeries(Long seriesId) {
        seriesRepository.deleteById(seriesId);
    }

    @Override
    public SeriesParticipant addParticipant(Long seriesId, Long swimmerId, int lane, String entryTime) {
        EventSeries series = seriesRepository.findById(seriesId)
                .orElseThrow(() -> new RuntimeException("Series not found: " + seriesId));
        User swimmer = userRepository.findById(swimmerId)
                .orElseThrow(() -> new RuntimeException("Swimmer not found: " + swimmerId));
        SeriesParticipant participant = new SeriesParticipant();
        participant.setSeries(series);
        participant.setSwimmer(swimmer);
        participant.setLane(lane);
        participant.setEntryTime(entryTime);
        return participantRepository.save(participant);
    }

    @Override
    public void deleteParticipant(Long participantId) {
        participantRepository.deleteById(participantId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ParticipantDTO> getAllParticipantsByCompetitionId(Long competitionId) {
        List<SeriesParticipant> participants = participantRepository.findAllByCompetitionId(competitionId);
        return participants.stream().map(this::mapParticipantToDTO).collect(Collectors.toList());
    }

    // ─── Legacy mapping helpers ───

    private ProgrammeDayDTO mapDayToDTO(CompetitionDay day) {
        List<ProgrammeEventDTO> events = day.getEvents() != null
                ? day.getEvents().stream().map(this::mapEventToDTO).collect(Collectors.toList())
                : List.of();
        return new ProgrammeDayDTO(day.getId(), day.getDayNumber(), day.getDate(), null, events);
    }

    private ProgrammeEventDTO mapEventToDTO(CompetitionEvent event) {
        List<SeriesDTO> series = event.getSeries() != null
                ? event.getSeries().stream().map(this::mapSeriesToDTO).collect(Collectors.toList())
                : List.of();
        return new ProgrammeEventDTO(
                event.getId(), event.getEventNumber(), event.getEventName(),
                event.getGender() != null ? event.getGender().name() : null,
                event.getDistance(), event.getStroke(), series);
    }

    private SeriesDTO mapSeriesToDTO(EventSeries series) {
        List<ParticipantDTO> participants = series.getParticipants() != null
                ? series.getParticipants().stream().map(this::mapParticipantToDTO).collect(Collectors.toList())
                : List.of();
        return new SeriesDTO(series.getId(), series.getSeriesNumber(), series.getStartTime(), participants);
    }

    private ParticipantDTO mapParticipantToDTO(SeriesParticipant p) {
        User swimmer = p.getSwimmer();
        return new ParticipantDTO(
                p.getId(), p.getLane(),
                swimmer != null ? swimmer.getId() : null,
                swimmer != null ? swimmer.getFirstName() : null,
                swimmer != null ? swimmer.getLastName() : null,
                swimmer != null && swimmer.getBirthDate() != null ? swimmer.getBirthDate().toString() : null,
                swimmer != null && swimmer.getGender() != null ? swimmer.getGender().name() : null,
                swimmer != null && swimmer.getClub() != null ? swimmer.getClub().getName() : null,
                p.getEntryTime());
    }
}
