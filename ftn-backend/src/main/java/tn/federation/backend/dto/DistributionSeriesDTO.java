package tn.federation.backend.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DistributionSeriesDTO {
    private Long seriesId;
    private String seriesLabel;
    private String swimmerCategory;
    private String time;
    private Integer capacity;
    private List<DistributionParticipantDTO> participants;
}
