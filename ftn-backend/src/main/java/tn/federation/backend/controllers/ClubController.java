package tn.federation.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tn.federation.backend.dto.ClubJoinRequestDTO;
import tn.federation.backend.dto.ImportResult;
import tn.federation.backend.dto.RegionOptionDto;
import tn.federation.backend.entities.*;

import java.util.Arrays;

import tn.federation.backend.repositories.*;
import tn.federation.backend.services.Abstraction.IClubService;
import tn.federation.backend.services.Abstraction.INotificationService;
import tn.federation.backend.dto.ClubAdminReportDTO;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/clubs")
public class ClubController {

    @Autowired
    private IClubService clubService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private ClubJoinRequestRepository clubJoinRequestRepository;

    @Autowired
    private ClubSeasonValidationRepository clubSeasonValidationRepository;

    @Autowired
    private LicenseRepository licenseRepository;

    @Autowired
    private INotificationService notificationService;

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

    @GetMapping(params = "name")
    public ResponseEntity<Club> getClubByName(@RequestParam String name) {
        return ResponseEntity.ok(clubService.findByName(name).orElse(null));
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

    @GetMapping("/my-clubs")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Club>> getMyClubs(@AuthenticationPrincipal UserDetails currentUser) {
        User swimmer = userRepository.findByEmail(currentUser.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));
        if (swimmer.getRole() != Role.SWIMMER || swimmer.getClub() == null) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        return ResponseEntity.ok(List.of(swimmer.getClub()));
    }

    @GetMapping("/my-join-requests")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ClubJoinRequestDTO>> getMyJoinRequests(@AuthenticationPrincipal UserDetails currentUser) {
        User swimmer = userRepository.findByEmail(currentUser.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));
        List<ClubJoinRequestDTO> requests = clubJoinRequestRepository
                .findBySwimmer_IdOrderByRequestedAtDesc(swimmer.getId())
                .stream()
                .map(ClubJoinRequestDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/join-requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ClubJoinRequestDTO>> getPendingJoinRequests() {
        List<ClubJoinRequestDTO> requests = clubJoinRequestRepository
                .findByStatusOrderByRequestedAtDesc(ClubJoinRequestStatus.PENDING)
                .stream()
                .map(ClubJoinRequestDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(requests);
    }

    @PutMapping("/join-requests/{requestId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClubJoinRequestDTO> approveJoinRequest(@PathVariable Long requestId) {
        ClubJoinRequest request = clubJoinRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Demande introuvable"));
        if (request.getStatus() != ClubJoinRequestStatus.PENDING) {
            throw new IllegalArgumentException("Cette demande a déjà été traitée.");
        }
        User swimmer = request.getSwimmer();
        swimmer.setClub(request.getClub());
        userRepository.save(swimmer);

        request.setStatus(ClubJoinRequestStatus.APPROVED);
        request.setReviewedAt(LocalDateTime.now());
        return ResponseEntity.ok(ClubJoinRequestDTO.fromEntity(clubJoinRequestRepository.save(request)));
    }

    @PutMapping("/join-requests/{requestId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ClubJoinRequestDTO> rejectJoinRequest(@PathVariable Long requestId) {
        ClubJoinRequest request = clubJoinRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Demande introuvable"));
        if (request.getStatus() != ClubJoinRequestStatus.PENDING) {
            throw new IllegalArgumentException("Cette demande a déjà été traitée.");
        }
        request.setStatus(ClubJoinRequestStatus.REJECTED);
        request.setReviewedAt(LocalDateTime.now());
        return ResponseEntity.ok(ClubJoinRequestDTO.fromEntity(clubJoinRequestRepository.save(request)));
    }

    @PostMapping("/{id:\\d+}/join-request")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> requestToJoinClub(
            @PathVariable long id,
            @AuthenticationPrincipal UserDetails currentUser) {
        User swimmer = userRepository.findByEmail(currentUser.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));
        if (swimmer.getRole() != Role.SWIMMER) {
            throw new IllegalArgumentException("Seuls les nageurs peuvent demander à rejoindre un club.");
        }
        if (swimmer.getClub() != null) {
            throw new IllegalArgumentException("Vous êtes déjà affilié(e) à un club.");
        }
        Club club = clubRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Club introuvable"));
        clubJoinRequestRepository
                .findBySwimmer_IdAndClub_IdAndStatus(swimmer.getId(), id, ClubJoinRequestStatus.PENDING)
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Une demande est déjà en attente pour ce club.");
                });
        if (clubJoinRequestRepository.existsBySwimmer_IdAndStatus(swimmer.getId(), ClubJoinRequestStatus.PENDING)) {
            throw new IllegalArgumentException("Vous avez déjà une demande d'adhésion en attente.");
        }

        ClubJoinRequest request = new ClubJoinRequest();
        request.setSwimmer(swimmer);
        request.setClub(club);
        request.setStatus(ClubJoinRequestStatus.PENDING);
        clubJoinRequestRepository.save(request);

        return ResponseEntity.ok(Map.of("message", "Demande d'adhésion envoyée au club " + club.getName() + "."));
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

    // ─── Season Validation by Coach (Club Manager) ────────────────────
    @PostMapping("/my-club/validate-season")
    @PreAuthorize("hasRole('COACH')")
    public ResponseEntity<ClubSeasonValidation> validateSeason(
            @RequestParam String season,
            @RequestParam(required = false) Long clubId,
            @RequestParam(required = false, defaultValue = "true") Boolean isValidated,
            @AuthenticationPrincipal UserDetails currentUser) {
        User coach = userRepository.findByEmail(currentUser.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Coach introuvable"));

        List<Club> clubs = clubRepository.findByCoachId(coach.getId());
        if (clubs.isEmpty()) {
            throw new IllegalArgumentException("Vous n'êtes assigné à aucun club.");
        }

        Club club;
        if (clubId != null) {
            club = clubs.stream()
                    .filter(c -> c.getId() == clubId)
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Club non assigné à ce coach."));
        } else {
            club = clubs.get(0);
        }

        String normalizedSeason = season.replace('/', '-').trim();

        ClubSeasonValidation validation = clubSeasonValidationRepository.findByClubIdAndSeason(club.getId(), normalizedSeason)
                .orElseGet(() -> {
                    ClubSeasonValidation v = new ClubSeasonValidation();
                    v.setClub(club);
                    v.setSeason(normalizedSeason);
                    return v;
                });

        validation.setIsValidated(isValidated);
        validation.setValidatedBy(coach);
        validation.setValidatedAt(LocalDateTime.now());

        ClubSeasonValidation saved = clubSeasonValidationRepository.save(validation);

        // Update validation status of all licenses of this club for this season
        List<License> licenses = licenseRepository.findByClub_Id(club.getId()).stream()
                .filter(l -> normalizedSeason.equals(l.getSeason()))
                .toList();
        for (License license : licenses) {
            license.setValidationStatus(isValidated ? tn.federation.backend.entities.LicenseStatus.VALIDATED : tn.federation.backend.entities.LicenseStatus.REJECTED);
        }
        licenseRepository.saveAll(licenses);

        // Notify administrator of the coach's decision
        notificationService.notifyAdminOfSeasonValidationDecision(coach, club, normalizedSeason, isValidated);

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/my-club/season-validation")
    @PreAuthorize("hasRole('COACH')")
    public ResponseEntity<List<Map<String, Object>>> getSeasonValidation(
            @RequestParam String season,
            @AuthenticationPrincipal UserDetails currentUser) {
        User coach = userRepository.findByEmail(currentUser.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Coach introuvable"));

        List<Club> clubs = clubRepository.findByCoachId(coach.getId());
        List<Map<String, Object>> result = new java.util.ArrayList<>();

        String normalizedSeason = season.replace('/', '-').trim();

        for (Club club : clubs) {
            java.util.Optional<ClubSeasonValidation> opt = clubSeasonValidationRepository.findByClubIdAndSeason(club.getId(), normalizedSeason);
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("clubId", club.getId());
            map.put("clubName", club.getName());

            if (opt.isPresent()) {
                ClubSeasonValidation validation = opt.get();
                map.put("isValidated", validation.getIsValidated());
                map.put("status", validation.getIsValidated() ? "VALIDATED" : "REFUSED");
                map.put("validatedAt", validation.getValidatedAt());
            } else {
                map.put("isValidated", false);
                map.put("status", "PENDING");
                map.put("validatedAt", null);
            }
            result.add(map);
        }

        return ResponseEntity.ok(result);
    }

    @PostMapping("/my-club/report-admin-error")
    @PreAuthorize("hasRole('COACH')")
    public ResponseEntity<Map<String, String>> reportAdminError(
            @RequestBody @Valid ClubAdminReportDTO report,
            @AuthenticationPrincipal UserDetails currentUser) {
        User coach = userRepository.findByEmail(currentUser.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Coach introuvable"));

        String normalizedSeason = report.getSeason().replace('/', '-').trim();

        notificationService.reportClubAdminError(
                coach,
                report.getClubId(),
                normalizedSeason,
                report.getFields(),
                report.getDescription());

        return ResponseEntity.ok(Map.of(
                "message", "Votre signalement a été enregistré. L'administration fédérale a été notifiée."));
    }

    @PostMapping("/season-validation/request")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> requestSeasonValidation(@RequestParam String season) {
        String normalizedSeason = season.replace('/', '-').trim();
        int notified = notificationService.requestSeasonValidationForAllCoaches(normalizedSeason);
        return ResponseEntity.ok(Map.of(
                "message", notified + " coach(s) notifié(s) pour la saison " + normalizedSeason,
                "notifiedCount", notified,
                "season", normalizedSeason));
    }
}
