package tn.federation.backend.dto;

import java.time.LocalTime;

public record SeriesResponse(
        Long id,
        String name,
        int sortOrder,
        LocalTime startTime,
        String metadata) {
}
