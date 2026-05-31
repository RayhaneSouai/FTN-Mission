package tn.federation.backend.entities.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import tn.federation.backend.entities.Piscine;

import java.util.Arrays;

/**
 * Tolerant mapping for legacy or misspelled pool names stored in the database.
 */
@Converter
public class PiscineConverter implements AttributeConverter<Piscine, String> {

    @Override
    public String convertToDatabaseColumn(Piscine attribute) {
        return attribute == null ? null : attribute.name();
    }

    @Override
    public Piscine convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return null;
        }
        String trimmed = dbData.trim();
        return Arrays.stream(Piscine.values())
                .filter(p -> p.name().equalsIgnoreCase(trimmed))
                .findFirst()
                .orElse(null);
    }
}
