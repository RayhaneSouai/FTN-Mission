package tn.federation.backend.services.ServiceImpl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import tn.federation.backend.entities.Competition;
import tn.federation.backend.repositories.CompetitionRepository;
import tn.federation.backend.services.Abstraction.ICompetitionService;

import java.util.List;

@Service
public class CompetitionServiceImpl implements ICompetitionService {

    @Autowired
    CompetitionRepository competitionRepository;

    @Override
    public Competition addCompetition(Competition competition) {
        return competitionRepository.save(competition);
    }

    @Override
    public Competition updateCompetition(Competition competition) {
        return competitionRepository.save(competition);
    }

    @Override
    public void deleteCompetition(long id) {
        competitionRepository.deleteById(id);
    }

    @Override
    public Competition getCompetitionById(long id) {
        return competitionRepository.findById(id).get();
    }

    @Override
    public List<Competition> getAllCompetitions() {
        return (List<Competition>) competitionRepository.findAll();
    }
}