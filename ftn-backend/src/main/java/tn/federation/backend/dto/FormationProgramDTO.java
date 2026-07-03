package tn.federation.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class FormationProgramDTO {
    private Long id;
    private String title;
    private String brevetType;
    private String registrationConditions;
    private BigDecimal registrationFee;
    private Integer spotsAvailable;
}
