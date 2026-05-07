package tn.federation.backend.entities.press;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PressItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPressItem;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(length = 1000)
    private String mediaUrl;

    @Column(length = 1000)
    private String linkUrl;

    private String discipline;
    // Champ author supprimé ici

    @Enumerated(EnumType.STRING)
    private PressType type;

    @Enumerated(EnumType.STRING)
    private PressStatus status;

    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
    
    @ManyToOne
    @JoinColumn(name = "parent_id")
    private PressItem parentPressItem;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = PressStatus.DRAFT;
    }
}
