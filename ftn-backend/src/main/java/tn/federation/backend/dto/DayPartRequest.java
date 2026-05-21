package tn.federation.backend.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;
import java.util.List;

public record DayPartRequest(
        @NotBlank(message = "Le libellé est obligatoire") String label,

        @NotNull(message = "L'heure de début est obligatoire") LocalTime startTime,

        String description,

        int sortOrder,

        @Valid List<SeriesRequest> series) {
}
