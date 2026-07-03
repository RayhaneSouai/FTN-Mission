package tn.federation.backend.services.ServiceImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import tn.federation.backend.dto.ClubCompetitionSummaryDTO;
import tn.federation.backend.dto.ClubDetailDTO;
import tn.federation.backend.dto.ClubRankingDTO;
import tn.federation.backend.entities.Club;
import tn.federation.backend.entities.Competition;
import tn.federation.backend.entities.Role;
import tn.federation.backend.entities.User;
import tn.federation.backend.repositories.ClubRepository;
import tn.federation.backend.repositories.EngagementRepository;
import tn.federation.backend.repositories.LicenseRepository;
import tn.federation.backend.repositories.PerformanceRepository;
import tn.federation.backend.repositories.UserRepository;
import tn.federation.backend.services.Abstraction.IClubService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ClubServiceImpl implements IClubService {

    @Autowired
    ClubRepository clubRepository;

    @Autowired
    LicenseRepository licenseRepository;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PerformanceRepository performanceRepository;

    @Autowired
    EngagementRepository engagementRepository;

    @Override
    public Club addClub(Club club) {
        String name = club.getName() != null ? club.getName().trim() : "";
        if (name.isBlank()) {
            throw new IllegalArgumentException("Nom du club obligatoire");
        }
        club.setName(name);
        Optional<Club> existing = clubRepository.findFirstByNameIgnoreCase(name);
        if (existing.isPresent()) {
            return existing.get();
        }
        return clubRepository.save(club);
    }

    @Override
    public Club updateClub(Club club) {
        return clubRepository.save(club);
    }

    @Override
    @Transactional
    public void deleteClub(long id) {
        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Club introuvable"));

        licenseRepository.deleteByClub_Id(id);

        userRepository.findByClub_Id(id).forEach(user -> {
            user.setClub(null);
            userRepository.save(user);
        });

        club.setCoach(null);
        clubRepository.delete(club);
    }

    @Override
    public Club getClubById(long id) {
        return clubRepository.findById(id).get();
    }

    @Override
    public ClubDetailDTO getClubDetail(long id) {
        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Club introuvable"));

        // Two targeted queries (one per role) rather than N+1 per-member lookups —
        // reuses the same repository method already used for the swimmers list/stats.
        List<User> athletes = clubRepository.findUsersByClubIdAndRole(id, Role.SWIMMER);
        List<User> coaches = clubRepository.findUsersByClubIdAndRole(id, Role.COACH);

        long totalPerformances = performanceRepository.countBySwimmer_Club_Id(id);
        long personalRecords = performanceRepository.countBySwimmer_Club_IdAndIsPersonalRecordTrue(id);

        return ClubDetailDTO.build(club, athletes, coaches, totalPerformances, personalRecords);
    }

    @Override
    public Optional<Club> findByName(String name) {
        if (name == null || name.trim().isBlank()) {
            return Optional.empty();
        }
        return clubRepository.findFirstByNameIgnoreCase(name.trim());
    }

    @Override
    public List<Club> getAllClubs() {
        return (List<Club>) clubRepository.findAll();
    }


    @Override
    public List<Club> getClubsByRegion(String region) {
        return clubRepository.findByRegion(region);
    }

    @Override
    public List<User> getSwimmersByClub(long clubId) {
        return clubRepository.findUsersByClubIdAndRole(clubId, Role.SWIMMER);
    }


    @Override
    public List<Club> getClubsForMap() {
        return clubRepository.findByLatitudeIsNotNullAndLongitudeIsNotNull();
    }

    @Override
    public Map<String, Object> getClubStatistics(long clubId) {
        Club club = clubRepository.findById(clubId).orElseThrow();
        List<User> swimmers = clubRepository.findUsersByClubIdAndRole(clubId, Role.SWIMMER);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalSwimmers", swimmers.size());
        stats.put("activeSwimmers", swimmers.stream().filter(u -> u.getActive() != null && u.getActive()).count());
        
        double avgAge = swimmers.stream()
                .filter(u -> u.getBirthDate() != null)
                .mapToInt(u -> java.time.Period.between(u.getBirthDate(), java.time.LocalDate.now()).getYears())
                .average()
                .orElse(0.0);
        stats.put("averageAge", avgAge);
        
        stats.put("competitionsCount", club.getLicenses() != null ? club.getLicenses().size() : 0);

        Map<String, Long> distribution = swimmers.stream()
                .filter(u -> u.getNiveau() != null)
                .collect(java.util.stream.Collectors.groupingBy(u -> u.getNiveau().name(), java.util.stream.Collectors.counting()));
        stats.put("distribution", distribution);

        return stats;
    }

    @Override
    public List<Club> searchClubs(String query) {
        return clubRepository.findByNameContainingIgnoreCaseOrRegionContainingIgnoreCase(query, query);
    }

    @Override
    public List<ClubRankingDTO> getTopClubsBySwimmers() {
        return clubRepository.findClubsRankedBySwimmerCount().stream()
                .limit(3)
                .map(club -> new ClubRankingDTO(
                        club.getId(),
                        club.getName(),
                        club.getRegion(),
                        userRepository.countByClub_Id(club.getId())))
                .toList();
    }

    @Override
    public List<ClubCompetitionSummaryDTO> getClubCompetitions(long clubId) {
        if (!clubRepository.existsById(clubId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Club introuvable");
        }
        List<Competition> competitions = engagementRepository.findDistinctCompetitionsByClubId(clubId);
        return competitions.stream()
                .map(competition -> ClubCompetitionSummaryDTO.from(
                        competition,
                        engagementRepository.countByClubIdAndCompetitionId(clubId, competition.getId())))
                .toList();
    }

    @Override
    @Transactional
    public void leaveClub(User swimmer) {
        if (swimmer.getRole() != Role.SWIMMER) {
            throw new IllegalArgumentException("Seuls les nageurs peuvent quitter un club.");
        }
        if (swimmer.getClub() == null) {
            throw new IllegalArgumentException("Vous n'êtes affilié(e) à aucun club.");
        }
        swimmer.setClub(null);
        userRepository.save(swimmer);
    }
}
