package tn.federation.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;


@Entity
@Data            // Lombok : génère automatiquement getters, setters, toString, equals
@NoArgsConstructor
@AllArgsConstructor
@Builder         // Lombok : permet la construction fluide → PressItem.builder().title("...").build()
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

    // Discipline sportive concernée (ex : "Natation", "Water Polo", "Plongeon")
    private String discipline;


    @Enumerated(EnumType.STRING)
    private PressType type;

    // Statut du cycle de vie : DRAFT → PUBLISHED → ARCHIVED ou DELETED
    @Enumerated(EnumType.STRING)
    @Column(length = 20) // Augmente la taille pour éviter "Data truncated"
    private PressStatus status;

    @Column(columnDefinition = "TEXT")
    private String summary;

    private String author;

    @Builder.Default
    private Long views = 0L;

    private LocalDateTime scheduledAt;

    @Builder.Default
    private String importance = "NORMAL"; // NORMAL, A_LA_UNE, URGENT, IMPORTANT

    @Builder.Default
    private Integer readTime = 0; // Temps moyen de lecture en minutes

    @Builder.Default
    private Long downloadsCount = 0L;

    @Column(columnDefinition = "TEXT")
    private String gallery; // Liste de liens d'images séparés par des virgules

    @Column(columnDefinition = "TEXT")
    private String documents; // Liste de liens PDF séparés par des virgules

    private LocalDateTime publishedAt;

    private LocalDateTime createdAt;

    /**
     garantit que chaque article en base de données aura toujours une date de création et toujours un statut par défaut
     */
    // Exécuté automatiquement AVANT un INSERT : fixe la date de création et le statut par défaut
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now(); // Horodatage automatique à la création
        if (status == null) status = PressStatus.DRAFT; // Statut par défaut si non précisé
        if (views == null) views = 0L;
        if (downloadsCount == null) downloadsCount = 0L;
        if (importance == null) importance = "NORMAL";
        if (readTime == null) readTime = 0;
    }

    // Exécuté automatiquement AVANT un UPDATE : protège createdAt contre l'écrasement
    @PreUpdate
    protected void onUpdate() {
        if (createdAt == null) createdAt = LocalDateTime.now(); // Garde la date originale
    }
}
