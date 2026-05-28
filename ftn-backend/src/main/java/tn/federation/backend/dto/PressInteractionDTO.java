package tn.federation.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PressInteractionDTO {
    private List<CommentDTO> comments;
    private Map<String, Long> reactionCounts; // e.g., {"LIKE": 5, "HEART": 2}
    private String currentUserReaction; // e.g., "LIKE", null if none
    private boolean isFavoritedByCurrentUser;
    private Long totalFavorites;

    private boolean isPinnedByCurrentUser;
    private Long totalPins;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CommentDTO {
        private Long id;
        private String text;
        private LocalDateTime createdAt;
        private Long userId;
        private String userName; // First + Last name
    }
}
