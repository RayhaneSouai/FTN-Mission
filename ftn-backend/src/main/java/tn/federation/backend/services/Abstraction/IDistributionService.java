package tn.federation.backend.services.Abstraction;

import tn.federation.backend.dto.DistributionResponseDTO;

public interface IDistributionService {
    DistributionResponseDTO generateDistribution(Long competitionId);

    DistributionResponseDTO approveDistribution(Long competitionId);

    DistributionResponseDTO getDistribution(Long competitionId);

    DistributionResponseDTO getApprovedDistribution(Long competitionId);
}
