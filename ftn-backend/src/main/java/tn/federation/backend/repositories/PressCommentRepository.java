package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.federation.backend.entities.PressComment;
import java.util.List;

@Repository
public interface PressCommentRepository extends JpaRepository<PressComment, Long> {
    List<PressComment> findByPressItemIdOrderByCreatedAtAsc(Long pressItemId);
}
