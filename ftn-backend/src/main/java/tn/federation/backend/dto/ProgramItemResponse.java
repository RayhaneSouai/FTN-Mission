package tn.federation.backend.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalTime;

public record ProgramItemResponse(
        Long id,
        String label,
        @JsonFormat(pattern = "HH:mm") LocalTime time,
        String type,
        Integer numberOfParticipants,
        String swimmerCategory,
        String seriesGender) {
}
