package tn.federation.backend.dto;

import java.util.List;

public record ProgrammeEventDTO(
        Long id,
        int eventNumber,
        String eventName,
        String gender,
        String distance,
        String stroke,
        List<SeriesDTO> series) {
}
