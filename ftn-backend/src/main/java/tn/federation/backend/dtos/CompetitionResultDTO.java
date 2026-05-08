package tn.federation.backend.dtos;

import lombok.*;
import java.time.LocalDateTime;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
public class CompetitionResultDTO {
    private Integer position;
    private Long swimmerId;
    private String swimmerFirstName;
    private String swimmerLastName;
    private Double officialTime;
    private Boolean disqualified;
    private LocalDateTime recordedAt; }
