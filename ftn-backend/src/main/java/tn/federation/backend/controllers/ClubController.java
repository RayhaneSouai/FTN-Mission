package tn.federation.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.federation.backend.entities.Club;
import tn.federation.backend.entities.User;
import tn.federation.backend.services.Abstraction.IClubService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clubs")
public class ClubController {

    @Autowired
    private IClubService clubService;

    // ─── CRUD ────────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<Club> createClub(@RequestBody Club club) {
        return ResponseEntity.ok(clubService.addClub(club));
    }

    @GetMapping
    public ResponseEntity<List<Club>> getAllClubs() {
        return ResponseEntity.ok(clubService.getAllClubs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Club> getClub(@PathVariable long id) {
        return ResponseEntity.ok(clubService.getClubById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Club> updateClub(@PathVariable long id, @RequestBody Club club) {
        club.setId(id);
        return ResponseEntity.ok(clubService.updateClub(club));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClub(@PathVariable long id) {
        clubService.deleteClub(id);
        return ResponseEntity.noContent().build();
    }

    // ─── Business ──────────────────────────────────────────────────────
    @GetMapping("/region/{region}")
    public ResponseEntity<List<Club>> getClubsByRegion(@PathVariable String region) {
        return ResponseEntity.ok(clubService.getClubsByRegion(region));
    }

    @GetMapping("/{id}/swimmers")
    public ResponseEntity<List<User>> getSwimmersByClub(@PathVariable long id) {
        return ResponseEntity.ok(clubService.getSwimmersByClub(id));
    }

    // ─── Advanced ───────────────────────────────────────────────────────
    @GetMapping("/map")
    public ResponseEntity<List<Club>> getClubsForMap() {
        return ResponseEntity.ok(clubService.getClubsForMap());
    }

    @GetMapping("/{id}/stats")
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
