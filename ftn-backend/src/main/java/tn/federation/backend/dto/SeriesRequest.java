package tn.federation.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

public record SeriesRequest(
        @NotBlank(message = "Le nom de la série est obligatoire") String name,

        int sortOrder,

        @NotNull(message = "L'heure de début est obligatoire") LocalTime startTime,

        String metadata) {
}
