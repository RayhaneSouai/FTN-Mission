package tn.federation.backend.dto;

import lombok.*;
import tn.federation.backend.entities.DistributionStatus;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DistributionResponseDTO {
    private Long competitionId;
    private String competitionName;
    private DistributionStatus status;
    private LocalDateTime generatedAt;
    private LocalDateTime approvedAt;
    private List<DistributionSeriesDTO> series;
}
