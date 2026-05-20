package tn.federation.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalTime;

public record ProgramItemRequest(
        @NotBlank(message = "Le libellé est obligatoire") String label,

        @NotNull(message = "L'heure est obligatoire") @JsonFormat(pattern = "HH:mm") LocalTime time,

        @NotNull(message = "Le type est obligatoire") String type, // "PART" or "SERIES"

        Integer numberOfParticipants // required only when type == SERIES
) {
}
