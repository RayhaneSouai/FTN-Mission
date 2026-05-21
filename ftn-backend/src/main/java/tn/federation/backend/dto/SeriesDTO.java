package tn.federation.backend.dto;

import java.time.LocalTime;
import java.util.List;

public record SeriesDTO(
        Long id,
        int seriesNumber,
        LocalTime startTime,
        List<ParticipantDTO> participants) {
}
