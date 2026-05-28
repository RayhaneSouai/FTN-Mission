package tn.federation.backend.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DistributionParticipantDTO {
    private Long swimmerId;
    private String swimmerFirstName;
    private String swimmerLastName;
    private Integer position;
    private Double bestTime;
}
