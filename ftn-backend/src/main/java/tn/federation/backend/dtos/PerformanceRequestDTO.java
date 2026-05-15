package tn.federation.backend.dtos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import lombok.*;
import tn.federation.backend.entities.StrokeType;
import java.time.LocalDate;
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@ToString

public class PerformanceRequestDTO {
    @NotNull(message = "Le temps est obligatoire")
    @Positive(message = "Le temps doit être positif")
    private Double time;

    @NotNull(message = "La distance est obligatoire")
    @Positive(message = "La distance doit être positive")
    private Integer distance;

    @NotNull(message = "Le style de nage est obligatoire")
    private StrokeType stroke;

    @NotNull(message = "La date est obligatoire")
    @PastOrPresent(message = "La date ne peut pas être future")
    private LocalDate date;

    @NotNull(message = "L'ID du nageur est obligatoire")
    private Long swimmerId; }
