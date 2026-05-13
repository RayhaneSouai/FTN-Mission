package tn.federation.backend.services.ServiceImpl;

import tn.federation.backend.services.Abstraction.ILicenseService;
import org.springframework.stereotype.Service;
import tn.federation.backend.entities.Club;
import tn.federation.backend.entities.License;
import tn.federation.backend.repositories.ClubRepository;
import tn.federation.backend.repositories.LicenseRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class LicenseServiceImpl implements ILicenseService {
    private final LicenseRepository licenseRepository;
    private final ClubRepository clubRepository;

    public LicenseServiceImpl(LicenseRepository licenseRepository, ClubRepository clubRepository) {
        this.licenseRepository = licenseRepository;
        this.clubRepository = clubRepository;
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
        if (license.getClub() == null || license.getClub().getId() == null) {
            throw new IllegalArgumentException("L'ID du club est obligatoire.");
        }

        Club club = clubRepository.findById(license.getClub().getId())
                .orElseThrow(() -> new IllegalArgumentException("Club introuvable avec id: " + license.getClub().getId()));

        license.setClub(club);
        
        // Generate license number if empty or null
        if (license.getLicenseNumber() == null || license.getLicenseNumber().trim().isEmpty()) {
            String regionPart = (club.getRegion() != null && !club.getRegion().isEmpty()) ? club.getRegion().toUpperCase() : "GEN";
            String generatedNumber = "LIC-" + regionPart + "-" + club.getId() + "-" + license.getSeason() + "-" + UUID.randomUUID().toString().substring(0, 8);
            license.setLicenseNumber(generatedNumber);
        }

        return licenseRepository.save(license);
    }

    @Override
    public License updateLicense(Long id, License licenseUpdates) {
        License existingLicense = licenseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Licence introuvable avec id: " + id));

        if (licenseUpdates.getClub() != null && licenseUpdates.getClub().getId() != null) {
            Club club = clubRepository.findById(licenseUpdates.getClub().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Club introuvable avec id: " + licenseUpdates.getClub().getId()));
            existingLicense.setClub(club);
        }
        
        existingLicense.setLicenseNumber(licenseUpdates.getLicenseNumber());
        existingLicense.setSeason(licenseUpdates.getSeason());
        existingLicense.setIssueDate(licenseUpdates.getIssueDate());
        existingLicense.setExpiryDate(licenseUpdates.getExpiryDate());

        return licenseRepository.save(existingLicense);
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
        List<Club> clubs = (List<Club>) clubRepository.findAll();
        List<License> newLicenses = clubs.stream()
                .filter(club -> licenseRepository.findBySeason(season).stream().noneMatch(l -> l.getClub().getId().equals(club.getId())))
                .map(club -> {
                    License l = new License();
                    String regionPart = (club.getRegion() != null && !club.getRegion().isEmpty()) ? club.getRegion().toUpperCase() : "GEN";
                    l.setLicenseNumber("LIC-" + regionPart + "-" + club.getId() + "-" + season + "-" + UUID.randomUUID().toString().substring(0, 8));
                    l.setSeason(season);
                    l.setIssueDate(LocalDate.now());
                    l.setExpiryDate(LocalDate.now().plusMonths(12));
                    l.setClub(club);
                    return l;
                })
                .toList();

        return licenseRepository.saveAll(newLicenses);
    }
}
