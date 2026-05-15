package tn.federation.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.federation.backend.dto.RegionOptionDto;
import tn.federation.backend.entities.Club;
import tn.federation.backend.entities.Region;
import tn.federation.backend.entities.User;

import java.util.Arrays;
import tn.federation.backend.services.Abstraction.IClubService;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clubs")
public class ClubController {

    @Autowired
    private IClubService clubService;

    // ─── Regions ─────────────────────────────────────────────────────
    @GetMapping("/regions")
    public ResponseEntity<List<RegionOptionDto>> getRegions(
            @RequestParam(required = false) String zone) {
        List<RegionOptionDto> regions = Arrays.stream(Region.values())
                .filter(r -> !r.isMacroZone())
                .filter(r -> zone == null || zone.isBlank() || matchesZone(r, zone))
                .map(r -> new RegionOptionDto(r.name(), r.getLabel()))
                .toList();
        return ResponseEntity.ok(regions);
    }

    @GetMapping("/zones")
    public ResponseEntity<List<RegionOptionDto>> getZones() {
        List<RegionOptionDto> zones = Arrays.stream(Region.values())
                .filter(Region::isMacroZone)
                .map(r -> new RegionOptionDto(r.name(), r.getLabel()))
                .toList();
        return ResponseEntity.ok(zones);
    }

    private boolean matchesZone(Region governorate, String zone) {
        return switch (zone.toUpperCase()) {
            case "GRAND_TUNIS" -> governorate == Region.TUNIS || governorate == Region.ARIANA
                    || governorate == Region.BEN_AROUS || governorate == Region.MANOUBA
                    || governorate == Region.BIZERTE || governorate == Region.NABEUL
                    || governorate == Region.ZAGHOUAN;
            case "SAHEL" -> governorate == Region.SOUSSE || governorate == Region.MONASTIR
                    || governorate == Region.MAHDIA || governorate == Region.KAIROUAN
                    || governorate == Region.SFAX;
            case "SUD" -> governorate == Region.SFAX || governorate == Region.GABES
                    || governorate == Region.MEDENINE || governorate == Region.TATAOUINE
                    || governorate == Region.TOZEUR || governorate == Region.KEBILI
                    || governorate == Region.GAFSA || governorate == Region.SIDI_BOUZID;
            default -> true;
        };
    }

    // ─── CRUD ────────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<Club> createClub(@RequestBody Club club) {
        return ResponseEntity.ok(clubService.addClub(club));
    }

    @GetMapping
    public ResponseEntity<List<Club>> getAllClubs() {
        return ResponseEntity.ok(clubService.getAllClubs());
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<Club> getClub(@PathVariable long id) {
        return ResponseEntity.ok(clubService.getClubById(id));
    }

    @PutMapping("/{id:\\d+}")
    public ResponseEntity<Club> updateClub(@PathVariable long id, @RequestBody Club club) {
        club.setId(id);
        return ResponseEntity.ok(clubService.updateClub(club));
    }

    @DeleteMapping("/{id:\\d+}")
    public ResponseEntity<Void> deleteClub(@PathVariable long id) {
        clubService.deleteClub(id);
        return ResponseEntity.noContent().build();
    }

    // ─── Business ──────────────────────────────────────────────────────
    @GetMapping("/region/{region}")
    public ResponseEntity<List<Club>> getClubsByRegion(@PathVariable String region) {
        return ResponseEntity.ok(clubService.getClubsByRegion(region));
    }

    @GetMapping("/{id:\\d+}/swimmers")
    public ResponseEntity<List<User>> getSwimmersByClub(@PathVariable long id) {
        return ResponseEntity.ok(clubService.getSwimmersByClub(id));
    }

    // ─── Advanced ───────────────────────────────────────────────────────
    @GetMapping("/map")
    public ResponseEntity<List<Club>> getClubsForMap() {
        return ResponseEntity.ok(clubService.getClubsForMap());
    }

    @GetMapping("/{id:\\d+}/stats")
    public ResponseEntity<Map<String, Object>> getClubStatistics(@PathVariable long id) {
        return ResponseEntity.ok(clubService.getClubStatistics(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Club>> searchClubs(@RequestParam String q) {
        return ResponseEntity.ok(clubService.searchClubs(q));
    }

    @GetMapping("/ranking")
    public ResponseEntity<List<Club>> getTopClubsBySwimmers() {
        return ResponseEntity.ok(clubService.getTopClubsBySwimmers());
    }
}
