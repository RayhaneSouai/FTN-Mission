package tn.federation.backend.services.ServiceImpl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.federation.backend.dto.CompetitionResultDTO;
import tn.federation.backend.dto.RankingEntryDTO;
import tn.federation.backend.entities.*;
import tn.federation.backend.repositories.ParticipationRepository;
import tn.federation.backend.repositories.PerformanceRepository;
import tn.federation.backend.services.Abstraction.IRankingService;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RankingServiceImpl implements IRankingService {

    private final PerformanceRepository performanceRepository;
    private final ParticipationRepository participationRepository;

    @Override
    public List<RankingEntryDTO> getNationalRanking(
            Integer distance,
            StrokeType stroke,
            Gender gender,
            Niveau niveau,
            Integer limit
    ) {

        Pageable pageable = PageRequest.of(0, limit != null ? limit : 10);

        List<Performance> performances =
                performanceRepository.findNationalRanking(
                        distance,
                        stroke,
                        gender,
                        niveau,
                        pageable
                );

        List<Performance> nationalRecords =
                performanceRepository.findNationalRecord(
                        distance,
                        stroke,
                        gender,
                        PageRequest.of(0, 1)
                );

        AtomicInteger rankCounter = new AtomicInteger(1);

        return performances.stream()
                .map(p -> RankingEntryDTO.builder()
                        .rank(rankCounter.getAndIncrement())
                        .swimmerId(p.getSwimmer().getId())
                        .swimmerFirstName(p.getSwimmer().getFirstName())
                        .swimmerLastName(p.getSwimmer().getLastName())
                        .category(p.getSwimmer().getNiveau())
                        .time(p.getTime())
                        .date(p.getDate())
                        .distance(p.getDistance())
                        .stroke(p.getStroke())
                        .isNationalRecord(
                                nationalRecords.stream()
                                        .anyMatch(r -> r.getId().equals(p.getId()))
                        )
                        .clubName(
                                p.getSwimmer().getClub() != null
                                        ? p.getSwimmer().getClub().getName()
                                        : null
                        )
                        .build()
                )
                .toList();
    }

    @Override
    public List<CompetitionResultDTO> getCompetitionResults(Long competitionId) {

        List<Participation> participations =
                participationRepository.findCompetitionResults(competitionId);

        AtomicInteger positionCounter = new AtomicInteger(1);

        return participations.stream()
                .map(p -> CompetitionResultDTO.builder()
                        .position(positionCounter.getAndIncrement())
                        .swimmerId(p.getSwimmer().getId())
                        .swimmerFirstName(p.getSwimmer().getFirstName())
                        .swimmerLastName(p.getSwimmer().getLastName())
                        .officialTime(p.getOfficialTime())
                        .disqualified(Boolean.TRUE.equals(p.getDisqualified()))
                        .recordedAt(p.getRecordedAt())
                        .build()
                )
                .toList();
    }
}