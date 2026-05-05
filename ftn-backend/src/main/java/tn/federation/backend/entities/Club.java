package tn.federation.backend.entities;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Entity
public class Club {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String region;
    private String address;
    private String contact;
    private String manager;
    private LocalDate affiliationDate;
    // private Double latitude; 9olna yetfas5ou
    // private Double longitude; 9olna yetfas5ou

    @ManyToOne
    @JoinColumn(name = "coach_id")
    User coach;

    @OneToMany(mappedBy = "club")
    private List<License> licenses;
}
