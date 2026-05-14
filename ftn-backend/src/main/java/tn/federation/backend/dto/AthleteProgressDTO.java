package tn.federation.backend.dto;

import java.util.List;

public class AthleteProgressDTO {
    private Long swimmerId;
    private List<PerformanceDTO> performances;

    public Long getSwimmerId() {
        return swimmerId;
    }

    public void setSwimmerId(Long swimmerId) {
        this.swimmerId = swimmerId;
    }

    public List<PerformanceDTO> getPerformances() {
        return performances;
    }

    public void setPerformances(List<PerformanceDTO> performances) {
        this.performances = performances;
    }
}
