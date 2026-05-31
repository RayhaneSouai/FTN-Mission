package tn.federation.backend.entities.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import tn.federation.backend.entities.Region;

/**
 * Tolerant mapping for legacy DB values (e.g. "Lac", "Tunis") that are not exact enum names.
 */
@Converter
public class RegionConverter implements AttributeConverter<Region, String> {

    @Override
    public String convertToDatabaseColumn(Region attribute) {
        return attribute == null ? null : attribute.name();
    }

    @Override
    public Region convertToEntityAttribute(String dbData) {
        return Region.fromValue(dbData).orElse(null);
    }
}
