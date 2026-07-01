package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.federation.backend.entities.MediaComment;
import java.util.List;

@Repository
public interface MediaCommentRepository extends JpaRepository<MediaComment, Long> {
    List<MediaComment> findByMediaItemIdOrderByCreatedAtAsc(Long mediaItemId);
}
