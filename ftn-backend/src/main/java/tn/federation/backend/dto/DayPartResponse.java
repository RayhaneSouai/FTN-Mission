package tn.federation.backend.dto;

import java.time.LocalTime;
import java.util.List;

public record DayPartResponse(
        Long id,
        String label,
        LocalTime startTime,
        String description,
        int sortOrder,
        List<SeriesResponse> series) {
}
