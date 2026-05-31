package tn.federation.backend.services.Abstraction;

import tn.federation.backend.entities.Season;

import java.util.List;

public interface ISeasonService {
    List<Season> findAll();

    Season findById(Long id);

    Season create(Season season);

    Season update(Long id, Season season);

    void delete(Long id);
}
