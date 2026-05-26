package tn.federation.backend.dto;

import lombok.*;
import tn.federation.backend.entities.Gender;
import tn.federation.backend.entities.StrokeType;
import java.time.LocalDate;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
public class RecordDTO {
    private Integer distance;
    private StrokeType stroke;
    private Gender gender;
    private Double recordTime;
    private LocalDate dateAchieved;
    private Long holderId;
    private String holderFirstName;
    private String holderLastName;
    private String holderClub;
}
