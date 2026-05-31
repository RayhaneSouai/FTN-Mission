package tn.federation.backend.entities;

/**
 * Strict FTN age categories with defined age ranges.
 */
public enum Categorie {
    AVENIRS(0, 9),
    POUSSINS(10, 11),
    BENJAMINS(12, 13),
    MINIMES(14, 15),
    CADETS(16, 17),
    JUNIORS_SENIORS(18, Integer.MAX_VALUE),
    /** Legacy DB values kept for existing rows created before JUNIORS_SENIORS. */
    JUNIORS(18, Integer.MAX_VALUE),
    SENIORS(18, Integer.MAX_VALUE);

    private final int minAge;
    private final int maxAge;

    Categorie(int minAge, int maxAge) {
        this.minAge = minAge;
        this.maxAge = maxAge;
    }

    public int getMinAge() {
        return minAge;
    }

    public int getMaxAge() {
        return maxAge;
    }
}
