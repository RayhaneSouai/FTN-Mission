package tn.federation.backend.services.Interfaces.ServiceImpl;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.federation.backend.dtos.RecordDTO;
import tn.federation.backend.entities.Gender;
import tn.federation.backend.entities.Performance;
import tn.federation.backend.entities.StrokeType;
import tn.federation.backend.repositories.PerformanceRepository;
import tn.federation.backend.services.Abstraction.IRecordService;
import java.util.List;
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecordServiceImpl implements IRecordService {
    private final PerformanceRepository performanceRepository;
    @Override public List<RecordDTO> getPersonalRecords(Long swimmerId) {
        return performanceRepository.findPersonalRecordsBySwimmer(swimmerId).stream() .map(this::toRecordDTO) .toList(); }
    @Override public List<RecordDTO> getAllNationalRecords() {
        return performanceRepository.findAllNationalRecords().stream() .map(this::toRecordDTO) .toList(); }
    @Override
    public RecordDTO getNationalRecordForEvent(Integer distance, StrokeType stroke, Gender gender) {
        Performance record = performanceRepository.findNationalRecord(distance, stroke, gender) .orElseThrow(() -> new EntityNotFoundException( String.format("Aucun record national trouvé pour %dm %s %s", distance, stroke, gender))); return toRecordDTO(record); }
    private RecordDTO toRecordDTO(Performance p) { return RecordDTO.builder() .distance(p.getDistance()) .stroke(p.getStroke()) .gender(p.getSwimmer().getGender()) .recordTime(p.getTime()) .dateAchieved(p.getDate()) .holderId(p.getSwimmer().getId()) .holderFirstName(p.getSwimmer().getFirstName()) .holderLastName(p.getSwimmer().getLastName()) .build(); } }
