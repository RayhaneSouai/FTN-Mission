package tn.federation.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ClubAdminReportDTO {
    @NotNull
    private Long clubId;

    @NotBlank
    private String season;

    private List<String> fields;

    private String description;
}
