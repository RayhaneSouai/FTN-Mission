package tn.federation.backend.dto;

import tn.federation.backend.entities.FormationProgram;
import tn.federation.backend.entities.FormationRegistration;
import tn.federation.backend.entities.FormationRegistrationStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record FormationRegistrationDTO(
        Long id,
        FormationRegistrationStatus status,
        LocalDateTime registeredAt,
        String eligibilityNote,
        String decisionNote,
        String phase,
        FormationProgram program,
        Long swimmerId,
        String swimmerName,
        String swimmerEmail
) {
    public static FormationRegistrationDTO fromEntity(FormationRegistration registration) {
        var swimmer = registration.getSwimmer();
        String swimmerName = swimmer != null
                ? (swimmer.getFirstName() + " " + swimmer.getLastName()).trim()
                : null;
        return new FormationRegistrationDTO(
                registration.getId(),
                registration.getStatus(),
                registration.getRegisteredAt(),
                registration.getEligibilityNote(),
                registration.getDecisionNote(),
                resolvePhase(registration.getProgram()),
                registration.getProgram(),
                swimmer != null ? swimmer.getId() : null,
                swimmerName,
                swimmer != null ? swimmer.getEmail() : null);
    }

    private static String resolvePhase(FormationProgram program) {
        LocalDate today = LocalDate.now();
        LocalDate theoreticalEnd = program.getTheoreticalEndDate();
        LocalDate practicalEnd = program.getPracticalPeriodEnd();

        if (isFullyCompleted(today, theoreticalEnd, practicalEnd)) {
            return "COMPLETED";
        }

        LocalDate start = firstNonNull(program.getTheoreticalStartDate(), program.getPracticalPeriodStart());
        LocalDate end = lastNonNull(practicalEnd, theoreticalEnd);

        if (start != null && !start.isAfter(today) && (end == null || !end.isBefore(today))) {
            return "ONGOING";
        }
        return "UPCOMING";
    }

    private static boolean isFullyCompleted(LocalDate today, LocalDate theoreticalEnd, LocalDate practicalEnd) {
        return theoreticalEnd != null
                && practicalEnd != null
                && theoreticalEnd.isBefore(today)
                && practicalEnd.isBefore(today);
    }

    private static LocalDate lastNonNull(LocalDate first, LocalDate second) {
        if (first != null && second != null) {
            return first.isAfter(second) ? first : second;
        }
        return first != null ? first : second;
    }

    private static LocalDate firstNonNull(LocalDate first, LocalDate second) {
        return first != null ? first : second;
    }
}
