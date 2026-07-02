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
        FormationProgram program
) {
    public static FormationRegistrationDTO fromEntity(FormationRegistration registration) {
        return new FormationRegistrationDTO(
                registration.getId(),
                registration.getStatus(),
                registration.getRegisteredAt(),
                registration.getEligibilityNote(),
                registration.getDecisionNote(),
                resolvePhase(registration.getProgram()),
                registration.getProgram());
    }

    private static String resolvePhase(FormationProgram program) {
        LocalDate today = LocalDate.now();
        LocalDate start = firstNonNull(program.getTheoreticalStartDate(), program.getPracticalPeriodStart());
        LocalDate end = firstNonNull(program.getPracticalPeriodEnd(), program.getTheoreticalEndDate());

        if (end != null && end.isBefore(today)) {
            return "COMPLETED";
        }
        if (start != null && !start.isAfter(today) && (end == null || !end.isBefore(today))) {
            return "ONGOING";
        }
        return "UPCOMING";
    }

    private static LocalDate firstNonNull(LocalDate first, LocalDate second) {
        return first != null ? first : second;
    }
}
