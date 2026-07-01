package tn.federation.backend.services.Abstraction;

import tn.federation.backend.entities.Competition;

import java.util.List;

public interface ICompetitionService {

    Competition addCompetition(Competition competition);

    Competition updateCompetition(Competition competition);

    void deleteCompetition(long id);

    Competition getCompetitionById(long id);

    List<Competition> getAllCompetitions();

    Competition archiveCompetition(long id);

    List<Competition> getArchivedCompetitions();
}