package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import tn.federation.backend.entities.Competition;


@Repository
public interface CompetitionRepository extends CrudRepository<Competition, Long> {


}

