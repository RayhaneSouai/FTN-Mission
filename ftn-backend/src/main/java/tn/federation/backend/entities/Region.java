package tn.federation.backend.entities;

import java.util.Arrays;
import java.util.Optional;

public enum Region {
    GRAND_TUNIS("Grand Tunis", "Tunis", "9.8,36.6,10.4,36.95"),
    SAHEL("Sahel", "Sousse", "10.4,35.5,11.2,36.0"),
    SUD("Sud", "Sfax", "9.0,33.0,11.5,35.0"),
    ARIANA("Ariana", "Ariana", "10.05,36.8,10.25,36.95"),
    BEJA("Béja", "Béja", "8.9,36.6,9.3,36.8"),
    BEN_AROUS("Ben Arous", "Ben Arous", "10.15,36.65,10.35,36.85"),
    BIZERTE("Bizerte", "Bizerte", "9.5,37.1,10.0,37.35"),
    GABES("Gabès", "Gabès", "10.0,33.7,10.3,34.0"),
    GAFSA("Gafsa", "Gafsa", "8.6,34.3,8.9,34.5"),
    JENDOUBA("Jendouba", "Jendouba", "8.5,36.4,8.9,36.6"),
    KAIROUAN("Kairouan", "Kairouan", "9.9,35.6,10.2,35.8"),
    KASSERINE("Kasserine", "Kasserine", "8.6,35.1,8.9,35.3"),
    KEBILI("Kébili", "Kébili", "8.9,33.5,9.2,33.8"),
    LE_KEF("Le Kef", "Le Kef", "8.6,36.1,8.8,36.2"),
    MAHDIA("Mahdia", "Mahdia", "10.9,35.4,11.1,35.6"),
    MANOUBA("Manouba", "Manouba", "10.05,36.75,10.2,36.9"),
    MEDENINE("Médenine", "Médenine", "10.4,33.2,10.7,33.6"),
    MONASTIR("Monastir", "Monastir", "10.7,35.6,10.9,35.8"),
    NABEUL("Nabeul", "Nabeul", "10.6,36.7,10.8,36.9"),
    SFAX("Sfax", "Sfax", "10.6,34.6,10.9,34.9"),
    SIDI_BOUZID("Sidi Bouzid", "Sidi Bouzid", "9.7,35.0,10.0,35.2"),
    SILIANA("Siliana", "Siliana", "9.3,35.9,9.5,36.1"),
    SOUSSE("Sousse", "Sousse", "10.5,35.7,10.7,35.9"),
    TATAOUINE("Tataouine", "Tataouine", "10.0,32.8,10.3,33.0"),
    TOZEUR("Tozeur", "Tozeur", "8.0,33.8,8.2,34.0"),
    TUNIS("Tunis", "Tunis", "10.1,36.7,10.25,36.85"),
    ZAGHOUAN("Zaghouan", "Zaghouan", "9.9,36.3,10.2,36.5");

    private final String label;
    private final String nominatimPlace;
    /** minLon,minLat,maxLon,maxLat — limite la recherche Photon au gouvernorat */
    private final String bbox;

    Region(String label, String nominatimPlace, String bbox) {
        this.label = label;
        this.nominatimPlace = nominatimPlace;
        this.bbox = bbox;
    }

    public String getLabel() {
        return label;
    }

    public String getNominatimPlace() {
        return nominatimPlace;
    }

    public String getBbox() {
        return bbox;
    }

    public boolean isMacroZone() {
        return this == GRAND_TUNIS || this == SAHEL || this == SUD;
    }

    public static Optional<Region> fromValue(String value) {
        if (value == null || value.isBlank()) {
            return Optional.empty();
        }
        String trimmed = value.trim();
        // Legacy DB labels from older Module4 imports
        if ("Lac".equalsIgnoreCase(trimmed)) {
            return Optional.of(GRAND_TUNIS);
        }
        return Arrays.stream(values())
                .filter(r -> r.name().equalsIgnoreCase(trimmed)
                        || r.label.equalsIgnoreCase(trimmed)
                        || r.nominatimPlace.equalsIgnoreCase(trimmed))
                .findFirst();
    }

    public static String resolveNominatimPlace(String region) {
        return fromValue(region).map(Region::getNominatimPlace).orElse(region);
    }
}
