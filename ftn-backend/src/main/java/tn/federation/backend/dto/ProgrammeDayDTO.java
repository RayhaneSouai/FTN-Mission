package tn.federation.backend.dto;

import java.time.LocalDate;
import java.util.List;

public record ProgrammeDayDTO(
        Long id,
        int dayNumber,
        LocalDate date,
        String session,
        List<ProgrammeEventDTO> events) {
}
