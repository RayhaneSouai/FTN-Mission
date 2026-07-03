package tn.federation.backend.dto;

import lombok.Data;

@Data
public class CommentMessageDTO {
    private Long pressItemId;
    private Long parentCommentId; // null for top-level comments
    private String text;
    private Long userId;
    private String userFirstName;
    private String userLastName;
}
