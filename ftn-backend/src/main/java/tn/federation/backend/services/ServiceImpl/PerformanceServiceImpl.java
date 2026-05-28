package tn.federation.backend.services.ServiceImpl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.federation.backend.dto.PerformanceRequestDTO;
import tn.federation.backend.dto.PerformanceResponseDTO;
import tn.federation.backend.entities.Performance;
import tn.federation.backend.entities.StrokeType;
import tn.federation.backend.entities.User;
import tn.federation.backend.mappers.PerformanceMapper;
import tn.federation.backend.repositories.PerformanceRepository;
import tn.federation.backend.repositories.UserRepository;
import tn.federation.backend.services.Abstraction.IPerformanceService;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PerformanceServiceImpl implements IPerformanceService {

    private final PerformanceRepository performanceRepository;
    private final UserRepository userRepository;
    private final PerformanceMapper mapper;

    // =====================================================
    // CREATE
    // =====================================================

    @Override
    public PerformanceResponseDTO create(PerformanceRequestDTO dto) {

        User swimmer = userRepository.findById(dto.getSwimmerId())
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Nageur introuvable avec id : " + dto.getSwimmerId()
                        )
                );

        Performance entity = mapper.toEntity(dto);
        entity.setSwimmer(swimmer);

        Performance saved = performanceRepository.save(entity);

        recomputePersonalRecord(saved);

        return enrichWithNationalFlag(saved);
    }

    // =====================================================
    // UPDATE
    // =====================================================

    @Override
    public PerformanceResponseDTO update(Long id, PerformanceRequestDTO dto) {

        Performance existing = performanceRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Performance introuvable avec id : " + id
                        )
                );

        // Changement nageur
        if (!existing.getSwimmer().getId().equals(dto.getSwimmerId())) {

            User newSwimmer = userRepository.findById(dto.getSwimmerId())
                    .orElseThrow(() ->
                            new EntityNotFoundException(
                                    "Nageur introuvable avec id : " + dto.getSwimmerId()
                            )
                    );

            existing.setSwimmer(newSwimmer);
        }

        mapper.updateEntityFromDto(dto, existing);

        Performance updated = performanceRepository.save(existing);

        recomputePersonalRecord(updated);

        return enrichWithNationalFlag(updated);
    }

    // =====================================================
    // DELETE
    // =====================================================

    @Override
    public void delete(Long id) {

        Performance toDelete = performanceRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Performance introuvable avec id : " + id
                        )
                );

        Long swimmerId = toDelete.getSwimmer().getId();
        Integer distance = toDelete.getDistance();
        StrokeType stroke = toDelete.getStroke();

        performanceRepository.delete(toDelete);

        reassignPersonalRecordAfterDelete(
                swimmerId,
                distance,
                stroke
        );
    }

    // =====================================================
    // FIND BY ID
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public PerformanceResponseDTO findById(Long id) {

        Performance entity = performanceRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException(
                                "Performance introuvable avec id : " + id
                        )
                );

        return enrichWithNationalFlag(entity);
    }

    // =====================================================
    // FIND ALL
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<PerformanceResponseDTO> findAll() {

        Set<Long> nationalRecordIds = performanceRepository
                .findAllNationalRecords()
                .stream()
                .map(Performance::getId)
                .collect(Collectors.toSet());

        return performanceRepository.findAll()
                .stream()
                .map(performance -> {

                    PerformanceResponseDTO dto = mapper.toDto(performance);

                    dto.setNationalRecord(
                            nationalRecordIds.contains(performance.getId())
                    );

                    return dto;
                })
                .toList();
    }

    // =====================================================
    // FIND BY SWIMMER
    // =====================================================

    @Override
    @Transactional(readOnly = true)
    public List<PerformanceResponseDTO> findBySwimmer(Long swimmerId) {

        return performanceRepository
                .findBySwimmerIdOrderByDateDesc(swimmerId)
                .stream()
                .map(this::enrichWithNationalFlag)
                .toList();
    }

    // =====================================================
    // PERSONAL RECORD RECALCULATION
    // =====================================================

    private void recomputePersonalRecord(Performance trigger) {

        Long swimmerId = trigger.getSwimmer().getId();

        List<Performance> performances =
                performanceRepository
                        .findBySwimmerIdAndDistanceAndStrokeOrderByDateDesc(
                                swimmerId,
                                trigger.getDistance(),
                                trigger.getStroke()
                        );

        if (performances.isEmpty()) return;

        Performance best = performances.stream()
                .min((a, b) -> Double.compare(a.getTime(), b.getTime()))
                .orElseThrow();

        for (Performance performance : performances) {

            boolean shouldBePR =
                    performance.getId().equals(best.getId());

            if (!Boolean.valueOf(shouldBePR)
                    .equals(performance.getIsPersonalRecord())) {

                performance.setIsPersonalRecord(shouldBePR);

                performanceRepository.save(performance);
            }
        }
    }

    // =====================================================
    // REASSIGN PR AFTER DELETE
    // =====================================================

    private void reassignPersonalRecordAfterDelete(
            Long swimmerId,
            Integer distance,
            StrokeType stroke
    ) {

        List<Performance> remaining =
                performanceRepository
                        .findBySwimmerIdAndDistanceAndStrokeOrderByDateDesc(
                                swimmerId,
                                distance,
                                stroke
                        );

        if (remaining.isEmpty()) return;

        Performance best = remaining.stream()
                .min((a, b) -> Double.compare(a.getTime(), b.getTime()))
                .orElseThrow();

        for (Performance performance : remaining) {

            boolean shouldBePR =
                    performance.getId().equals(best.getId());

            if (!Boolean.valueOf(shouldBePR)
                    .equals(performance.getIsPersonalRecord())) {

                performance.setIsPersonalRecord(shouldBePR);

                performanceRepository.save(performance);
            }
        }
    }

    // =====================================================
    // NATIONAL RECORD FLAG
    // =====================================================

    private PerformanceResponseDTO enrichWithNationalFlag(
            Performance entity
    ) {

        PerformanceResponseDTO dto = mapper.toDto(entity);

        List<Performance> nationalRecords =
                performanceRepository.findNationalRecord(
                        entity.getDistance(),
                        entity.getStroke(),
                        entity.getSwimmer().getGender()

                );

        boolean isNationalRecord = nationalRecords.stream()
                .anyMatch(p -> p.getId().equals(entity.getId()));

        dto.setNationalRecord(isNationalRecord);

        return dto;
    }
}