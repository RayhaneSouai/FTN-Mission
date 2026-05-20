package tn.federation.backend.services.Abstraction;

import tn.federation.backend.dtos.PerformanceRequestDTO;
import tn.federation.backend.dtos.PerformanceResponseDTO;
import java.util.List;
public interface IPerformanceService {
    PerformanceResponseDTO create(PerformanceRequestDTO dto);
    PerformanceResponseDTO update(Long id, PerformanceRequestDTO dto);
    void delete(Long id);
    PerformanceResponseDTO findById(Long id);
    List<PerformanceResponseDTO> findAll();
    List<PerformanceResponseDTO> findBySwimmer(Long swimmerId); }

