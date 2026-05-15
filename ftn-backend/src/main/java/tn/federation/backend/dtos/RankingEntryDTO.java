package tn.federation.backend.dtos;

import lombok.*;
import tn.federation.backend.entities.Niveau;
import tn.federation.backend.entities.StrokeType;
import java.time.LocalDate;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
public class RankingEntryDTO {
    private Integer rank;
    private Long swimmerId;
    private String swimmerFirstName;
    private String swimmerLastName;
    private Niveau category;
     private Double time;
     private LocalDate date;

    private Integer distance;
    private StrokeType stroke;
    private Boolean isNationalRecord; }


