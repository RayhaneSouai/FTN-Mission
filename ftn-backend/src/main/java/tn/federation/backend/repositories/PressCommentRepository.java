package tn.federation.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import tn.federation.backend.entities.PressComment;
import java.util.List;

@Repository
public interface PressCommentRepository extends JpaRepository<PressComment, Long> {

    @Query("SELECT c FROM PressComment c WHERE c.pressItem.idPressItem = :pressItemId ORDER BY c.createdAt ASC")
    List<PressComment> findByPressItemIdOrderByCreatedAtAsc(@Param("pressItemId") Long pressItemId);

    @Query("SELECT c FROM PressComment c WHERE c.pressItem.idPressItem = :pressItemId AND c.parentComment IS NULL ORDER BY c.createdAt ASC")
    List<PressComment> findRootCommentsByPressItemId(@Param("pressItemId") Long pressItemId);

    @Query("SELECT c FROM PressComment c WHERE c.parentComment.id = :parentId ORDER BY c.createdAt ASC")
    List<PressComment> findRepliesByParentId(@Param("parentId") Long parentId);
}
