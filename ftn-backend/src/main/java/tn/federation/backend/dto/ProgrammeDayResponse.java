package tn.federation.backend.dto;

import java.time.LocalDate;
import java.util.List;

public record ProgrammeDayResponse(
        Long id,
        int dayNumber,
        LocalDate date,
        List<ProgramItemResponse> items) {
}
