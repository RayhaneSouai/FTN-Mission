package tn.federation.backend.services.ServiceImpl;

import tn.federation.backend.services.Abstraction.ILicenseService;
import tn.federation.backend.services.Abstraction.INotificationService;
import org.springframework.stereotype.Service;
import tn.federation.backend.entities.Club;
import tn.federation.backend.entities.License;
import tn.federation.backend.entities.User;
import tn.federation.backend.entities.Role;
import tn.federation.backend.repositories.ClubRepository;
import tn.federation.backend.repositories.LicenseRepository;
import tn.federation.backend.repositories.ClubSeasonValidationRepository;
import tn.federation.backend.repositories.UserRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class LicenseServiceImpl implements ILicenseService {
    private final LicenseRepository licenseRepository;
    private final ClubRepository clubRepository;
    private final ClubSeasonValidationRepository clubSeasonValidationRepository;
    private final INotificationService notificationService;
    private final UserRepository userRepository;

    public LicenseServiceImpl(LicenseRepository licenseRepository, 
                              ClubRepository clubRepository, 
                              ClubSeasonValidationRepository clubSeasonValidationRepository,
                              INotificationService notificationService,
                              UserRepository userRepository) {
        this.licenseRepository = licenseRepository;
        this.clubRepository = clubRepository;
        this.clubSeasonValidationRepository = clubSeasonValidationRepository;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @Override
    public List<License> findAllLicenses() {
        return licenseRepository.findAll();
    }

    @Override
    public License findById(Long id) {
        return licenseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Licence introuvable avec id: " + id));
    }

    @Override
    public License createLicense(License license) {
        if (license.getClub() != null && license.getClub().getId() != null) {
            Club club = clubRepository.findById(license.getClub().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Club introuvable avec id: " + license.getClub().getId()));
            license.setClub(club);
        } else {
            license.setClub(null);
        }

        if (license.getSwimmer() != null && license.getSwimmer().getId() != null) {
            User swimmer = userRepository.findById(license.getSwimmer().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Nageur introuvable avec id: " + license.getSwimmer().getId()));
            license.setSwimmer(swimmer);
        } else {
            license.setSwimmer(null);
        }
        
        if (license.getSeason() != null) {
            license.setSeason(license.getSeason().replace('/', '-').trim());
        }
        
        // Generate license number if empty or null
        if (license.getLicenseNumber() == null || license.getLicenseNumber().trim().isEmpty()) {
            String regionPart = "GEN";
            String clubPart = "IND";
            if (license.getClub() != null) {
                regionPart = (license.getClub().getRegion() != null && !license.getClub().getRegion().isEmpty()) ? license.getClub().getRegion().toUpperCase() : "GEN";
                clubPart = license.getClub().getId().toString();
            }
            String generatedNumber = "LIC-" + regionPart + "-" + clubPart + "-" + license.getSeason() + "-" + UUID.randomUUID().toString().substring(0, 8);
            license.setLicenseNumber(generatedNumber);
        }

        License saved = licenseRepository.save(license);

        if ("PENDING".equals(saved.getValidationStatus()) && saved.getClub() != null) {
            notificationService.notifyCoachOfPendingLicense(saved);
        }

        return saved;
    }

    @Override
    public License updateLicense(Long id, License licenseUpdates) {
        License existingLicense = licenseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Licence introuvable avec id: " + id));

        if (licenseUpdates.getClub() != null && licenseUpdates.getClub().getId() != null) {
            Club club = clubRepository.findById(licenseUpdates.getClub().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Club introuvable avec id: " + licenseUpdates.getClub().getId()));
            existingLicense.setClub(club);
        } else {
            existingLicense.setClub(null);
        }

        if (licenseUpdates.getSwimmer() != null && licenseUpdates.getSwimmer().getId() != null) {
            User swimmer = userRepository.findById(licenseUpdates.getSwimmer().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Nageur introuvable avec id: " + licenseUpdates.getSwimmer().getId()));
            existingLicense.setSwimmer(swimmer);
        } else {
            existingLicense.setSwimmer(null);
        }
        
        existingLicense.setLicenseNumber(licenseUpdates.getLicenseNumber());
        if (licenseUpdates.getSeason() != null) {
            existingLicense.setSeason(licenseUpdates.getSeason().replace('/', '-').trim());
        }
        existingLicense.setIssueDate(licenseUpdates.getIssueDate());
        existingLicense.setExpiryDate(licenseUpdates.getExpiryDate());

        if (licenseUpdates.getValidationStatus() != null) {
            existingLicense.setValidationStatus(licenseUpdates.getValidationStatus());
        }

        License saved = licenseRepository.save(existingLicense);

        if ("PENDING".equals(saved.getValidationStatus()) && saved.getClub() != null) {
            notificationService.notifyCoachOfPendingLicense(saved);
        }

        return saved;
    }

    @Override
    public void deleteLicense(Long id) {
        if (!licenseRepository.existsById(id)) {
            throw new IllegalArgumentException("Licence introuvable avec id: " + id);
        }
        licenseRepository.deleteById(id);
    }

    @Override
    public List<License> generateLicensesForSeason(String season) {
        String normalizedSeason = season.replace('/', '-').trim();
        List<Club> clubs = (List<Club>) clubRepository.findAll();
        List<License> newLicenses = new java.util.ArrayList<>();

        for (Club club : clubs) {
            if (clubSeasonValidationRepository.existsByClubIdAndSeasonAndIsValidatedTrue(club.getId(), normalizedSeason)) {
                List<User> swimmers = userRepository.findByClub_Id(club.getId()).stream()
                        .filter(u -> Role.SWIMMER.equals(u.getRole()))
                        .toList();

                for (User swimmer : swimmers) {
                    boolean hasLicense = licenseRepository.findAll().stream()
                            .anyMatch(l -> l.getSwimmer() != null && 
                                           l.getSwimmer().getId().equals(swimmer.getId()) && 
                                           normalizedSeason.equals(l.getSeason()));
                    
                    if (!hasLicense) {
                        License l = new License();
                        String regionPart = (club.getRegion() != null && !club.getRegion().isEmpty()) ? club.getRegion().toUpperCase() : "GEN";
                        l.setLicenseNumber("LIC-" + regionPart + "-" + club.getId() + "-" + normalizedSeason + "-" + UUID.randomUUID().toString().substring(0, 8));
                        l.setSeason(normalizedSeason);
                        l.setIssueDate(LocalDate.now());
                        l.setExpiryDate(LocalDate.now().plusMonths(12));
                        l.setClub(club);
                        l.setSwimmer(swimmer);
                        l.setValidationStatus("VALIDATED");
                        newLicenses.add(l);
                    }
                }
            }
        }

        return licenseRepository.saveAll(newLicenses);
    }

    @Override
    public License findByLicenseNumber(String licenseNumber) {
        return licenseRepository.findByLicenseNumber(licenseNumber)
                .orElseThrow(() -> new IllegalArgumentException("Licence introuvable avec le numéro : " + licenseNumber));
    }
}
