package tn.federation.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GeocodeSuggestion {
    private String displayName;
    private Double latitude;
    private Double longitude;
}
