package tn.federation.backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Entity
public class License {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false)
    private String licenseNumber;
    private String season;
    private LocalDate issueDate;
    private LocalDate expiryDate;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "club_id")
    Club club;
}
