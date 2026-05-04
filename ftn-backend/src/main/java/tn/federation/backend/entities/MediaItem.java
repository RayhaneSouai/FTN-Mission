package tn.federation.backend.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Entity
public class MediaItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String url;
    @Enumerated(EnumType.STRING)
    private MediaType type;
    private String caption;
    private LocalDateTime uploadedAt;

    @ManyToOne
    @JoinColumn(name = "competition_id")
    Competition competition;
}
