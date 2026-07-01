package tn.federation.backend.services.ServiceImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.federation.backend.entities.Club;
import tn.federation.backend.entities.Role;
import tn.federation.backend.entities.User;
import tn.federation.backend.repositories.ClubRepository;
import tn.federation.backend.repositories.LicenseRepository;
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

    @Override
    public Club addClub(Club club) {
        String name = club.getName() != null ? club.getName().trim() : "";
        if (name.isBlank()) {
            throw new IllegalArgumentException("Nom du club obligatoire");
        }
        if (club.getCoach() == null) {
            throw new IllegalArgumentException("Un club doit avoir au moins un coach/manager (le coach est obligatoire).");
        }
        if (club.getManager() == null || club.getManager().trim().isEmpty()) {
            throw new IllegalArgumentException("Un club doit avoir au moins un coach/manager (le manager est obligatoire).");
        }
        club.setName(name);
        Optional<Club> existing = clubRepository.findFirstByNameIgnoreCase(name);
        if (existing.isPresent()) {
            Club existingClub = existing.get();
            if (existingClub.getCoach() == null) {
                existingClub.setCoach(club.getCoach());
            }
            if (existingClub.getManager() == null || existingClub.getManager().trim().isEmpty()) {
                existingClub.setManager(club.getManager());
            }
            return clubRepository.save(existingClub);
        }
        return clubRepository.save(club);
    }

    @Override
    public Club updateClub(Club club) {
        if (club.getCoach() == null) {
            throw new IllegalArgumentException("Un club doit avoir au moins un coach/manager (le coach est obligatoire).");
        }
        if (club.getManager() == null || club.getManager().trim().isEmpty()) {
            throw new IllegalArgumentException("Un club doit avoir au moins un coach/manager (le manager est obligatoire).");
        }
        if (club.getId() != null) {
            List<User> clubUsers = userRepository.findByClub_Id(club.getId());
            if (clubUsers.isEmpty() && userRepository.count() > 10) {
                throw new IllegalArgumentException("Un club doit obligatoirement avoir des utilisateurs.");
            }
        }
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
    public List<Club> getTopClubsBySwimmers() {
        return clubRepository.findClubsRankedBySwimmerCount();
    }
}
