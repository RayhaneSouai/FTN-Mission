package tn.federation.backend.services.Abstraction;

import tn.federation.backend.dto.CompetitionResultDTO;
import tn.federation.backend.dto.RankingEntryDTO;
import tn.federation.backend.entities.Gender;
import tn.federation.backend.entities.Niveau;
import tn.federation.backend.entities.StrokeType;
import java.util.List;
public interface IRankingService {
    List<RankingEntryDTO> getNationalRanking(Integer distance, StrokeType stroke, Gender gender, Niveau niveau, Integer limit);
    List<CompetitionResultDTO> getCompetitionResults(Long competitionId);
}

