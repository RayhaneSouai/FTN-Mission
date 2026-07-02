package tn.federation.backend.utils;

import tn.federation.backend.entities.Categorie;

import java.time.LocalDate;
import java.time.Period;
import java.util.Set;

/**
 * Utility to determine the FTN age category from a swimmer's birth date
 * and derive min/max age from a set of categories.
 */
public final class AgeCategoryUtil {

    private AgeCategoryUtil() {
    }

    public static void validateNiveauAge(tn.federation.backend.entities.Niveau niveau, java.time.LocalDate birthDate) {
        if (niveau == null || birthDate == null) return;
        int age = java.time.Period.between(birthDate, java.time.LocalDate.now()).getYears();
        boolean valid = false;
        switch (niveau) {
            case POUSSIN: valid = age <= 11; break;
            case BENJAMIN: valid = age >= 12 && age <= 13; break;
            case MINIME: valid = age >= 14 && age <= 15; break;
            case CADET: valid = age >= 16 && age <= 17; break;
            case JUNIOR: valid = age >= 18 && age <= 19; break;
            case SENIOR: valid = age >= 20 && age <= 24; break;
            case MASTER: valid = age >= 25; break;
        }
        if (!valid) {
            throw new IllegalArgumentException("Le niveau " + niveau + " ne correspond pas à la date de naissance (âge actuel : " + age + " ans).");
        }
    }

    /**
     * Determines the strict FTN age category based on swimmer's age at competition
     * start.
     * AVENIRS: 0-9, POUSSINS: 10-11, BENJAMINS: 12-13,
     * MINIMES: 14-15, CADETS: 16-17, JUNIORS_SENIORS: 18+
     */
    public static Categorie determineCategory(LocalDate birthDate, LocalDate referenceDate) {
        int age = Period.between(birthDate, referenceDate).getYears();

        for (Categorie cat : Categorie.values()) {
            if (age >= cat.getMinAge() && age <= cat.getMaxAge()) {
                return cat;
            }
        }
        return Categorie.JUNIORS_SENIORS;
    }

    /**
     * Checks if the swimmer's category is allowed for the competition.
     * Empty/null set means all swimmers are eligible.
     */
    public static boolean isCategoryAllowed(Categorie swimmerCategory, Set<Categorie> allowedCategories) {
        if (allowedCategories == null || allowedCategories.isEmpty())
            return true;
        if (swimmerCategory == Categorie.JUNIORS_SENIORS &&
                (allowedCategories.contains(Categorie.JUNIORS) || allowedCategories.contains(Categorie.SENIORS)))
            return true;
        return allowedCategories.contains(swimmerCategory);
    }

    /**
     * Derives the absolute minimum age from a set of categories.
     * Returns null if the set is empty.
     */
    public static Integer deriveMinAge(Set<Categorie> categories) {
        if (categories == null || categories.isEmpty())
            return null;
        return categories.stream()
                .mapToInt(Categorie::getMinAge)
                .min()
                .orElse(0);
    }

    /**
     * Derives the absolute maximum age from a set of categories.
     * Returns null if the set is empty or contains JUNIORS_SENIORS (unbounded).
     */
    public static Integer deriveMaxAge(Set<Categorie> categories) {
        if (categories == null || categories.isEmpty())
            return null;
        if (categories.contains(Categorie.JUNIORS_SENIORS)
                || categories.contains(Categorie.JUNIORS)
                || categories.contains(Categorie.SENIORS))
            return null;
        return categories.stream()
                .mapToInt(Categorie::getMaxAge)
                .max()
                .orElse(99);
    }
}
