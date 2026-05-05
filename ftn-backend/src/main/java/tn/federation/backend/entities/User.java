package tn.federation.backend.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Entity
@Table(name = "user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String firstName;
    private String lastName;

    @Column(unique = true, nullable = false)
    private String email;
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
    private Boolean active;
    private LocalDateTime createdAt;

    // swimmer-specific fields (null if role != SWIMMER)
    private LocalDate birthDate;
    @Enumerated(EnumType.STRING)
    private Gender gender;
    @Enumerated(EnumType.STRING)
    private Niveau niveau;
    @Enumerated(EnumType.STRING)
    private Discipline discipline;

    // coach-specific fields (null if role != COACH)
    private Integer anciennete;

    // Coach 1 (gérer) * Club
    @OneToMany(mappedBy = "coach")
    private List<Club> clubs;

    // Swimmer 1 (possede) * Performance
    @OneToMany(mappedBy = "swimmer")
    private List<Participation> participations;

    @OneToMany(mappedBy = "swimmer")
    private List<Performance> performances;
}
