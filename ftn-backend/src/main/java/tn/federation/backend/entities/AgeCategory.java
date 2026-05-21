package tn.federation.backend.entities;

import java.time.LocalDate;
import java.time.Period;

/**
 * Catégories d'âge officielles de la Fédération Tunisienne de Natation.
 */
public enum AgeCategory {

    AVENIRS_POUSSINS("Avenirs/Poussins", 9, 11),
    BENJAMINS("Benjamins", 12, 13),
    MINIMES("Minimes", 14, 15),
    CADETS("Cadets", 16, 17),
    JUNIORS_SENIORS("Juniors/Seniors", 18, 99),
    TC("Toutes Catégories", 0, 99);

    private final String label;
    private final int minAge;
    private final int maxAge;

    AgeCategory(String label, int minAge, int maxAge) {
        this.label = label;
        this.minAge = minAge;
        this.maxAge = maxAge;
    }

    public String getLabel() {
        return label;
    }

    public int getMinAge() {
        return minAge;
    }

    public int getMaxAge() {
        return maxAge;
    }

    /**
     * Détermine la catégorie d'âge d'un nageur en fonction de sa date de naissance
     * et de la date de référence (généralement la date de début de la compétition).
     */
    public static AgeCategory fromBirthDate(LocalDate birthDate, LocalDate referenceDate) {
        if (birthDate == null || referenceDate == null) {
            return null;
        }
        int age = Period.between(birthDate, referenceDate).getYears();
        if (age >= 18)
            return JUNIORS_SENIORS;
        if (age >= 16)
            return CADETS;
        if (age >= 14)
            return MINIMES;
        if (age >= 12)
            return BENJAMINS;
        if (age >= 9)
            return AVENIRS_POUSSINS;
        return null; // trop jeune
    }

    /**
     * Vérifie si un nageur d'un âge donné est éligible pour cette catégorie.
     */
    public boolean isEligible(LocalDate birthDate, LocalDate referenceDate) {
        if (this == TC)
            return true;
        if (birthDate == null || referenceDate == null)
            return false;
        int age = Period.between(birthDate, referenceDate).getYears();
        return age >= minAge && age <= maxAge;
    }
}
