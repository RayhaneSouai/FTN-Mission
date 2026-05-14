package tn.federation.backend.services.Interfaces.ServiceImpl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.federation.backend.dtos.PerformanceRequestDTO;
import tn.federation.backend.dtos.PerformanceResponseDTO;
import tn.federation.backend.entities.Performance;
import tn.federation.backend.entities.User;
import tn.federation.backend.mappers.PerformanceMapper;
import tn.federation.backend.repositories.PerformanceRepository;
import tn.federation.backend.repositories.UserRepository;
import tn.federation.backend.services.Abstraction.IPerformanceService;
import java.util.List;
import java.util.Optional;
@Service
@RequiredArgsConstructor
@Transactional
public class PerformanceServiceImpl implements IPerformanceService {

    private final PerformanceRepository performanceRepository;
    private final UserRepository userRepository;
    private final PerformanceMapper mapper;


    @Override
    public PerformanceResponseDTO create(PerformanceRequestDTO dto) {
        User swimmer = userRepository.findById(dto.getSwimmerId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Nageur introuvable avec id: " + dto.getSwimmerId()));

        Performance entity = mapper.toEntity(dto);
        entity.setSwimmer(swimmer);

        Performance saved = performanceRepository.save(entity);

        recomputePersonalRecord(saved);

        return enrichWithNationalFlag(saved);
    }


    @Override
    public PerformanceResponseDTO update(Long id, PerformanceRequestDTO dto) {
        Performance existing = performanceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Performance introuvable avec id: " + id));

        if (!existing.getSwimmer().getId().equals(dto.getSwimmerId())) {
            User newSwimmer = userRepository.findById(dto.getSwimmerId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Nageur introuvable avec id: " + dto.getSwimmerId()));
            existing.setSwimmer(newSwimmer);
        }

        mapper.updateEntityFromDto(dto, existing);
        Performance updated = performanceRepository.save(existing);

        recomputePersonalRecord(updated);

        return enrichWithNationalFlag(updated);
    }


    @Override
    public void delete(Long id) {
        Performance toDelete = performanceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Performance introuvable avec id: " + id));

        Long swimmerId = toDelete.getSwimmer().getId();
        Integer distance = toDelete.getDistance();
        var stroke = toDelete.getStroke();

        performanceRepository.deleteById(id);

        reassignPersonalRecordAfterDelete(swimmerId, distance, stroke);
    }


    @Override
    @Transactional(readOnly = true)
    public PerformanceResponseDTO findById(Long id) {
        Performance entity = performanceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Performance introuvable avec id: " + id));
        return enrichWithNationalFlag(entity);
    }


    @Override
    @Transactional(readOnly = true)
    public List<PerformanceResponseDTO> findAll() {
        return performanceRepository.findAll().stream()
                .map(this::enrichWithNationalFlag)
                .toList();
    }


    @Override
    @Transactional(readOnly = true)
    public List<PerformanceResponseDTO> findBySwimmer(Long swimmerId) {
        return performanceRepository.findBySwimmerIdOrderByDateDesc(swimmerId).stream()
                .map(this::enrichWithNationalFlag)
                .toList();
    }

       private void recomputePersonalRecord(Performance trigger) {
        Long swimmerId = trigger.getSwimmer().getId();
        Integer distance = trigger.getDistance();
        var stroke = trigger.getStroke();

        List<Performance> allPerfs = performanceRepository
                .findBySwimmerIdAndDistanceAndStrokeOrderByDateDesc(swimmerId, distance, stroke);

        if (allPerfs.isEmpty()) return;

        Performance best = allPerfs.stream()
                .min((a, b) -> Double.compare(a.getTime(), b.getTime()))
                .orElseThrow();

        for (Performance p : allPerfs) {
            boolean shouldBePR = p.getId().equals(best.getId());
            if (!Boolean.valueOf(shouldBePR).equals(p.getIsPersonalRecord())) {
                p.setIsPersonalRecord(shouldBePR);
                performanceRepository.save(p);
            }
        }
    }


    private void reassignPersonalRecordAfterDelete(Long swimmerId, Integer distance,
                                                   tn.federation.backend.entities.StrokeType stroke) {
        List<Performance> remaining = performanceRepository
                .findBySwimmerIdAndDistanceAndStrokeOrderByDateDesc(swimmerId, distance, stroke);

        if (remaining.isEmpty()) return;

        Performance best = remaining.stream()
                .min((a, b) -> Double.compare(a.getTime(), b.getTime()))
                .orElseThrow();

        for (Performance p : remaining) {
            boolean shouldBePR = p.getId().equals(best.getId());
            if (!Boolean.valueOf(shouldBePR).equals(p.getIsPersonalRecord())) {
                p.setIsPersonalRecord(shouldBePR);
                performanceRepository.save(p);
            }
        }
    }


    private PerformanceResponseDTO enrichWithNationalFlag(Performance entity) {
        PerformanceResponseDTO dto = mapper.toDto(entity);

        Optional<Performance> national = performanceRepository.findNationalRecord(
                entity.getDistance(),
                entity.getStroke(),
                entity.getSwimmer().getGender()
        );
        dto.setNationalRecord(national.isPresent() && national.get().getId().equals(entity.getId()));

        return dto;
    }
}


