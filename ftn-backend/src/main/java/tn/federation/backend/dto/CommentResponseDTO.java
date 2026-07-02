package tn.federation.backend.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder(toBuilder = true)
public class CommentResponseDTO {
    private Long id;
    private String text;
    private LocalDateTime createdAt;
    private Long userId;
    private String userFirstName;
    private String userLastName;
    private Long pressItemId;
    private Long parentCommentId;
    private List<CommentResponseDTO> replies;
}
