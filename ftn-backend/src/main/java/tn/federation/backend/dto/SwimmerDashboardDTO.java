package tn.federation.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SwimmerDashboardDTO {
    private long totalParticipations;
    private long totalPerformances;
    private long totalFavorites;
    private boolean hasActiveLicense;
}
