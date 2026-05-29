package tn.federation.backend.dto;

import lombok.*;
import tn.federation.backend.entities.StrokeType;
import java.time.LocalDate;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString
@Builder
public class PerformanceResponseDTO {
    private Long id;
    private Double time;
    private Integer distance;
    private StrokeType stroke;
    private LocalDate date;
    private Long swimmerId;
    private String swimmerFirstName;
    private String swimmerLastName;
    private Boolean personalRecord;
    private Boolean nationalRecord; }

