package tn.federation.backend.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.federation.backend.dtos.CompetitionResultDTO;
import tn.federation.backend.dtos.RankingEntryDTO;
import tn.federation.backend.entities.Gender;
import tn.federation.backend.entities.Niveau;
import tn.federation.backend.entities.StrokeType;
import tn.federation.backend.services.Abstraction.IRankingService;
import java.util.List;
@RestController
@RequestMapping("/api/rankings")
@RequiredArgsConstructor
@Tag(name = "Rankings", description = "Classements nationaux et par compétition")
public class RankingController {
    private final IRankingService rankingService;
    @Operation(summary = "Classement national par épreuve", description = "Retourne le top N des meilleurs chronos nationaux pour une épreuve et un genre donnés. " + "Filtre optionnel par catégorie d'âge.")
    @GetMapping("/national")
    public ResponseEntity<List<RankingEntryDTO>> getNationalRanking(
            @Parameter(description = "Distance en mètres", example = "100")
            @RequestParam Integer distance,
            @Parameter(description = "Style de nage", example = "LIBRE")
            @RequestParam StrokeType stroke,
            @Parameter(description = "Genre", example = "HOMME")
            @RequestParam Gender gender,
            @Parameter(description = "Catégorie (optionnel)", example = "SENIOR")
            @RequestParam(required = false) Niveau niveau,
            @Parameter(description = "Nombre max de résultats", example = "10")
            @RequestParam(defaultValue = "50") Integer limit) {
        return ResponseEntity.ok(rankingService.getNationalRanking(distance, stroke, gender, niveau, limit)); }
    @Operation(summary = "Résultats d'une compétition", description = "Retourne les résultats officiels classés d'une compétition (hors disqualifiés)")
    @GetMapping("/competition/{competitionId}")
    public ResponseEntity<List<CompetitionResultDTO>> getCompetitionResults(
            @PathVariable Long competitionId) { return ResponseEntity.ok(rankingService.getCompetitionResults(competitionId)); } }
