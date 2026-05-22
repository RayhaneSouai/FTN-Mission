package tn.federation.backend.dto;

import jakarta.validation.constraints.NotBlank;
import tn.federation.backend.entities.SponsorshipType;

public class SponsorshipRequestDTO {

    private Long swimmerId;

    private SponsorshipType typeSponsor;

    private String details;

    public Long getSwimmerId() {
        return swimmerId;
    }

    public void setSwimmerId(Long swimmerId) {
        this.swimmerId = swimmerId;
    }

    public SponsorshipType getTypeSponsor() {
        return typeSponsor;
    }

    public void setTypeSponsor(SponsorshipType typeSponsor) {
        this.typeSponsor = typeSponsor;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }
}

