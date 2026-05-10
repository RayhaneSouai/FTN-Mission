package tn.federation.backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString(exclude = {"coach", "licenses", "swimmers"})
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
    private Double latitude;
    private Double longitude;

    @JsonIgnore
    @ManyToOne
    @JoinColumn(name = "coach_id")
    User coach;

    @JsonIgnore
    @OneToMany(mappedBy = "club")
    private List<License> licenses;

    @JsonIgnore
    @OneToMany(mappedBy = "club")
    private List<User> swimmers;
}
