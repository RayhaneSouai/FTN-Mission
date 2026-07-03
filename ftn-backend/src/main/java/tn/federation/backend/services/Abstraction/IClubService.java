package tn.federation.backend.services.Abstraction;

import org.springframework.web.multipart.MultipartFile;
import tn.federation.backend.dto.ClubCompetitionSummaryDTO;
import tn.federation.backend.dto.ClubDetailDTO;
import tn.federation.backend.dto.ClubRankingDTO;
import tn.federation.backend.dto.ImportResult;
import tn.federation.backend.entities.Club;
import tn.federation.backend.entities.User;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface IClubService {


    Club addClub(Club club);
    Club updateClub(Club club);
    void deleteClub(long id);
    Club getClubById(long id);
    ClubDetailDTO getClubDetail(long id);
    Optional<Club> findByName(String name);
    List<Club> getAllClubs();


    List<Club> getClubsByRegion(String region);
    List<User> getSwimmersByClub(long clubId);


    List<Club> getClubsForMap();
    Map<String, Object> getClubStatistics(long clubId);
    List<Club> searchClubs(String query);
    List<ClubRankingDTO> getTopClubsBySwimmers();
    List<ClubCompetitionSummaryDTO> getClubCompetitions(long clubId);
    void leaveClub(User swimmer);
    ImportResult importClubsFromCSV(MultipartFile file);
}
