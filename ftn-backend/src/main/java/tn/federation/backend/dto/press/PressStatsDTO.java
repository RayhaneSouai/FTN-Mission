package tn.federation.backend.dto.press;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
//elle regroupe toutes les statistiques des articles (PressItem)
public class PressStatsDTO {
    private long total;
    private long published;
    private long draft;
    private long archived;
    private long deleted;
    
    private Map<String, Long> countByType;
    private Map<String, Long> countByDiscipline;
}
