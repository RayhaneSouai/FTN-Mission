package tn.federation.backend.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "formation_certificate")
public class FormationCertificate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "program_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private FormationProgram program;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "swimmer_id", nullable = false)
    @JsonIgnoreProperties({"passwordHash", "participations", "performances", "clubs"})
    private User swimmer;

    @Column(nullable = false, unique = true, length = 80)
    private String verificationCode;

    private LocalDate issuedAt;

    @Column(length = 600)
    private String pdfUrl;

    private boolean downloadable = true;
    private boolean verified = true;
}
