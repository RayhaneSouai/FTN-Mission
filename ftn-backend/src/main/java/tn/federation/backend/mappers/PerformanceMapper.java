package tn.federation.backend.mappers;

import org.springframework.stereotype.Component;
import tn.federation.backend.dto.PerformanceRequestDTO;
import tn.federation.backend.dto.PerformanceResponseDTO;
import tn.federation.backend.entities.Performance;
import tn.federation.backend.entities.User;
@Component
public class PerformanceMapper {

    public PerformanceResponseDTO toDto(Performance entity) {
        if (entity == null) return null;

        PerformanceResponseDTO dto = PerformanceResponseDTO.builder()
                .id(entity.getId())
                .time(entity.getTime())
                .distance(entity.getDistance())
                .stroke(entity.getStroke())
                .date(entity.getDate())

                .personalRecord(Boolean.TRUE.equals(entity.getIsPersonalRecord()))
                .nationalRecord(false)
                .build();

        if (entity.getSwimmer() != null) {
            User swimmer = entity.getSwimmer();
            dto.setSwimmerId(swimmer.getId());
            dto.setSwimmerFirstName(swimmer.getFirstName());
            dto.setSwimmerLastName(swimmer.getLastName());
        }

        return dto;
    }

    public Performance toEntity(PerformanceRequestDTO dto) {
        if (dto == null) return null;

        Performance entity = new Performance();
        entity.setTime(dto.getTime());
        entity.setDistance(dto.getDistance());
        entity.setStroke(dto.getStroke());
        entity.setDate(dto.getDate());
        entity.setIsPersonalRecord(false);
        return entity;
    }

    public void updateEntityFromDto(PerformanceRequestDTO dto, Performance entity) {
        if (dto == null || entity == null) return;
        entity.setTime(dto.getTime());
        entity.setDistance(dto.getDistance());
        entity.setStroke(dto.getStroke());
        entity.setDate(dto.getDate());
    }
}
