package tn.federation.backend.dto;

import jakarta.validation.Valid;

import java.util.List;

/**
 * Request to create program items for a day.
 * Days are auto-generated, so no date/dayNumber needed from the client.
 */
public record CreateDayRequest(
        @Valid List<ProgramItemRequest> items) {
}
