package tn.federation.backend.dto;

import tn.federation.backend.entities.Club;
import tn.federation.backend.entities.User;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;

/**
 * Full club detail page payload: club info, member rosters, and aggregate stats.
 * Built entirely from fields that already exist on Club/User/Performance —
 * no description/logo fields exist on Club today, so they're omitted rather
 * than invented.
 */
public record ClubDetailDTO(
        Long id,
        String name,
        String region,
        String address,
        String contact,
        String manager,
        LocalDate affiliationDate,
        String discipline,
        int maxCapacity,
        boolean active,
        List<Member> athletes,
        List<Member> coaches,
        Stats stats
) {
    public record Member(
            Long id,
            String fullName,
            String email,
            Integer age,
            String category,
            String discipline
    ) {}

    public record Stats(
            int athleteCount,
            int coachCount,
            long totalPerformances,
            long personalRecordsCount
    ) {}

    public static ClubDetailDTO build(Club club, List<User> athletes, List<User> coaches,
                                      long totalPerformances, long personalRecordsCount) {
        return new ClubDetailDTO(
                club.getId(),
                club.getName(),
                club.getRegion(),
                club.getAddress(),
                club.getContact(),
                club.getManager(),
                club.getAffiliationDate(),
                club.getDiscipline() != null ? club.getDiscipline().name() : null,
                club.getMaxCapacity(),
                club.isActive(),
                athletes.stream().map(u -> toMember(u, u.getNiveau() != null ? u.getNiveau().name() : null)).toList(),
                coaches.stream().map(u -> toMember(u, u.getAnciennete() != null ? u.getAnciennete() + " ans d'ancienneté" : null)).toList(),
                new Stats(athletes.size(), coaches.size(), totalPerformances, personalRecordsCount)
        );
    }

    private static Member toMember(User user, String category) {
        String fullName = (user.getFirstName() + " " + user.getLastName()).trim();
        Integer age = user.getBirthDate() != null ? Period.between(user.getBirthDate(), LocalDate.now()).getYears() : null;
        String discipline = user.getDiscipline() != null ? user.getDiscipline().name() : null;
        return new Member(user.getId(), fullName, user.getEmail(), age, category, discipline);
    }
}
