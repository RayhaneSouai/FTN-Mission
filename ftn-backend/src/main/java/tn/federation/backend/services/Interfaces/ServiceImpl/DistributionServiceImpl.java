package tn.federation.backend.services.Interfaces.ServiceImpl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.federation.backend.dto.DistributionParticipantDTO;
import tn.federation.backend.dto.DistributionResponseDTO;
import tn.federation.backend.dto.DistributionSeriesDTO;
import tn.federation.backend.entities.*;
import tn.federation.backend.repositories.ParticipantDistributionRepository;
import tn.federation.backend.repositories.ParticipationRepository;
import tn.federation.backend.repositories.PerformanceRepository;
import tn.federation.backend.repositories.ProgramItemRepository;
import tn.federation.backend.services.Abstraction.IDistributionService;

import java.time.LocalDateTime;
import java.time.Period;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DistributionServiceImpl implements IDistributionService {

    private final ParticipantDistributionRepository distributionRepository;
    private final ParticipationRepository participationRepository;
    private final ProgramItemRepository programItemRepository;
    private final PerformanceRepository performanceRepository;

    @Override
    @Transactional
    public DistributionResponseDTO generateDistribution(Long competitionId) {
        // Prevent regeneration if already approved
        if (distributionRepository.existsByCompetitionIdAndStatus(competitionId, DistributionStatus.APPROVED)) {
            throw new IllegalStateException("La répartition est déjà approuvée. Impossible de régénérer.");
        }

        // Clear any previous generated distribution
        distributionRepository.deleteByCompetitionId(competitionId);

        // Get approved participants
        List<Participation> approvedParticipations = participationRepository
                .findByCompetitionIdAndStatus(competitionId, ParticipationRequestStatus.APPROVED);

        if (approvedParticipations.isEmpty()) {
            throw new IllegalStateException("Aucun participant approuvé pour cette compétition.");
        }

        // Get series (ProgramItems of type SERIES) for this competition
        List<ProgramItem> seriesItems = programItemRepository
                .findByDayCompetitionIdAndType(competitionId, ProgramItemType.SERIES);

        if (seriesItems.isEmpty()) {
            throw new IllegalStateException("Aucune série définie dans le programme de cette compétition.");
        }

        Competition competition = approvedParticipations.get(0).getCompetition();
        LocalDateTime now = LocalDateTime.now();
        List<ParticipantDistribution> allDistributions = new ArrayList<>();

        // Process each series
        for (ProgramItem series : seriesItems) {
            if (series.getNumberOfParticipants() == null || series.getNumberOfParticipants() <= 0) {
                continue; // Skip series without capacity
            }

            Categorie seriesCategory = series.getSwimmerCategory();
            Gender seriesGender = series.getSeriesGender();

            // Filter participants matching the series category and gender
            List<Participation> eligibleParticipants = approvedParticipations.stream()
                    .filter(p -> isSwimmerEligibleForSeries(p.getSwimmer(), seriesCategory, seriesGender, competition))
                    .collect(Collectors.toList());

            // Sort by best performance (ASC - fastest first)
            eligibleParticipants.sort((a, b) -> {
                Double bestTimeA = getBestTime(a.getSwimmer().getId());
                Double bestTimeB = getBestTime(b.getSwimmer().getId());
                if (bestTimeA == null && bestTimeB == null)
                    return 0;
                if (bestTimeA == null)
                    return 1;
                if (bestTimeB == null)
                    return -1;
                return Double.compare(bestTimeA, bestTimeB);
            });

            // Distribute swimmers up to series capacity
            int capacity = series.getNumberOfParticipants();
            int count = 0;
            for (Participation participation : eligibleParticipants) {
                if (count >= capacity)
                    break;

                // Check if swimmer already assigned to another series
                boolean alreadyAssigned = allDistributions.stream()
                        .anyMatch(d -> d.getSwimmer().getId().equals(participation.getSwimmer().getId()));
                if (alreadyAssigned)
                    continue;

                ParticipantDistribution distribution = new ParticipantDistribution();
                distribution.setCompetition(competition);
                distribution.setSeries(series);
                distribution.setSwimmer(participation.getSwimmer());
                distribution.setPosition(count + 1);
                distribution.setStatus(DistributionStatus.GENERATED);
                distribution.setGeneratedAt(now);

                allDistributions.add(distribution);
                count++;
            }
        }

        if (allDistributions.isEmpty()) {
            throw new IllegalStateException(
                    "Impossible de générer la répartition: aucun participant ne correspond aux catégories des séries.");
        }

        distributionRepository.saveAll(allDistributions);

        return buildDistributionResponse(competitionId, allDistributions);
    }

    @Override
    @Transactional
    public DistributionResponseDTO approveDistribution(Long competitionId) {
        List<ParticipantDistribution> distributions = distributionRepository
                .findByCompetitionIdOrderBySeriesIdAscPositionAsc(competitionId);

        if (distributions.isEmpty()) {
            throw new IllegalStateException("Aucune répartition générée pour cette compétition.");
        }

        if (distributions.get(0).getStatus() == DistributionStatus.APPROVED) {
            throw new IllegalStateException("La répartition est déjà approuvée.");
        }

        LocalDateTime now = LocalDateTime.now();
        for (ParticipantDistribution d : distributions) {
            d.setStatus(DistributionStatus.APPROVED);
            d.setApprovedAt(now);
        }
        distributionRepository.saveAll(distributions);

        return buildDistributionResponse(competitionId, distributions);
    }

    @Override
    @Transactional(readOnly = true)
    public DistributionResponseDTO getDistribution(Long competitionId) {
        List<ParticipantDistribution> distributions = distributionRepository
                .findByCompetitionIdOrderBySeriesIdAscPositionAsc(competitionId);

        if (distributions.isEmpty()) {
            return null;
        }

        return buildDistributionResponse(competitionId, distributions);
    }

    @Override
    @Transactional(readOnly = true)
    public DistributionResponseDTO getApprovedDistribution(Long competitionId) {
        List<ParticipantDistribution> distributions = distributionRepository
                .findByCompetitionIdAndStatus(competitionId, DistributionStatus.APPROVED);

        if (distributions.isEmpty()) {
            return null;
        }

        // Sort by series then position
        distributions.sort(Comparator
                .comparing((ParticipantDistribution d) -> d.getSeries().getId())
                .thenComparing(ParticipantDistribution::getPosition));

        return buildDistributionResponse(competitionId, distributions);
    }

    // ─── Private Helpers ───

    private boolean isSwimmerEligibleForSeries(User swimmer, Categorie seriesCategory, Gender seriesGender,
            Competition competition) {
        // Gender filter: if series has a gender restriction, swimmer must match
        // If swimmer has no gender set, allow them (data may be incomplete)
        if (seriesGender != null && swimmer.getGender() != null && swimmer.getGender() != seriesGender) {
            return false;
        }

        if (seriesCategory == null)
            return true; // No category restriction

        if (swimmer.getBirthDate() == null)
            return false;

        int age = Period.between(swimmer.getBirthDate(), competition.getStartDate()).getYears();
        return age >= seriesCategory.getMinAge() && age <= seriesCategory.getMaxAge();
    }

    private Double getBestTime(Long swimmerId) {
        List<Performance> performances = performanceRepository.findBySwimmerIdOrderByDateDesc(swimmerId);
        return performances.stream()
                .map(Performance::getTime)
                .filter(Objects::nonNull)
                .min(Double::compareTo)
                .orElse(null);
    }

    private DistributionResponseDTO buildDistributionResponse(Long competitionId,
            List<ParticipantDistribution> distributions) {
        if (distributions.isEmpty())
            return null;

        Competition competition = distributions.get(0).getCompetition();
        DistributionStatus status = distributions.get(0).getStatus();
        LocalDateTime generatedAt = distributions.get(0).getGeneratedAt();
        LocalDateTime approvedAt = distributions.get(0).getApprovedAt();

        // Group by series
        Map<ProgramItem, List<ParticipantDistribution>> grouped = distributions.stream()
                .collect(Collectors.groupingBy(ParticipantDistribution::getSeries,
                        LinkedHashMap::new, Collectors.toList()));

        List<DistributionSeriesDTO> seriesList = new ArrayList<>();
        for (Map.Entry<ProgramItem, List<ParticipantDistribution>> entry : grouped.entrySet()) {
            ProgramItem series = entry.getKey();
            List<ParticipantDistribution> seriesDistributions = entry.getValue();

            List<DistributionParticipantDTO> participants = seriesDistributions.stream()
                    .map(d -> DistributionParticipantDTO.builder()
                            .swimmerId(d.getSwimmer().getId())
                            .swimmerFirstName(d.getSwimmer().getFirstName())
                            .swimmerLastName(d.getSwimmer().getLastName())
                            .position(d.getPosition())
                            .bestTime(getBestTime(d.getSwimmer().getId()))
                            .build())
                    .toList();

            seriesList.add(DistributionSeriesDTO.builder()
                    .seriesId(series.getId())
                    .seriesLabel(series.getLabel())
                    .swimmerCategory(series.getSwimmerCategory() != null ? series.getSwimmerCategory().name() : null)
                    .time(series.getTime() != null ? series.getTime().toString() : null)
                    .capacity(series.getNumberOfParticipants())
                    .participants(participants)
                    .build());
        }

        return DistributionResponseDTO.builder()
                .competitionId(competitionId)
                .competitionName(competition.getName())
                .status(status)
                .generatedAt(generatedAt)
                .approvedAt(approvedAt)
                .series(seriesList)
                .build();
    }
}
