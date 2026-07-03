package tn.federation.backend.services.Abstraction;

import tn.federation.backend.entities.License;
import java.util.List;

public interface ILicenseService {
    List<License> findAllLicenses();
    License findById(Long id);
    License createLicense(License license);
    List<License> createLicensesForClub(License licenseTemplate);
    License updateLicense(Long id, License license);
    void deleteLicense(Long id);
    List<License> generateLicensesForSeason(String season);
    License findByLicenseNumber(String licenseNumber);
}
