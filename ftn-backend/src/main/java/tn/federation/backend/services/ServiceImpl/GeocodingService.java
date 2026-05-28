package tn.federation.backend.services.ServiceImpl;

import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import tn.federation.backend.dto.GeocodeSuggestion;
import tn.federation.backend.entities.Region;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GeocodingService {

    private static final Logger log = LoggerFactory.getLogger(GeocodingService.class);
    private static final String PHOTON_API = "https://photon.komoot.io/api/";
    private static final String TUNISIA_BBOX = "7.5,30.2,11.6,37.5";
    private static final int MAX_SUGGESTIONS = 5;
    private static final long CACHE_TTL_MS = 10 * 60 * 1000L;
    private static final long MIN_INTERVAL_MS = 250L;

    private final RestTemplate restTemplate;
    private final ConcurrentHashMap<String, CacheEntry> cache = new ConcurrentHashMap<>();
    private long lastExternalCallMs = 0L;

    public GeocodingService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public List<GeocodeSuggestion> search(String address, String region) {
        if (address == null || address.isBlank() || region == null || region.isBlank()) {
            return List.of();
        }

        String trimmedAddress = address.trim();
        if (trimmedAddress.length() < 4) {
            return List.of();
        }

        String cacheKey = (region + "|" + trimmedAddress).toLowerCase();
        CacheEntry cached = cache.get(cacheKey);
        if (cached != null && cached.expiresAt > System.currentTimeMillis()) {
            return cached.results;
        }

        String place = Region.resolveNominatimPlace(region);
        String query = trimmedAddress + ", " + place + ", Tunisie";
        String bbox = Region.fromValue(region).map(Region::getBbox).orElse(TUNISIA_BBOX);

        try {
            throttleExternalCall();

            UriComponentsBuilder builder = UriComponentsBuilder
                    .fromHttpUrl(PHOTON_API)
                    .queryParam("q", query)
                    .queryParam("limit", MAX_SUGGESTIONS)
                    .queryParam("lang", "fr")
                    .queryParam("bbox", bbox);

            ResponseEntity<JsonNode> response = restTemplate.getForEntity(
                    builder.build(true).toUri(),
                    JsonNode.class
            );

            List<GeocodeSuggestion> results = parsePhotonResponse(response.getBody());
            cache.put(cacheKey, new CacheEntry(results, System.currentTimeMillis() + CACHE_TTL_MS));
            return results;
        } catch (RestClientException ex) {
            log.warn("Geocoding failed for '{}': {}", query, ex.getMessage());
            return List.of();
        }
    }

    private synchronized void throttleExternalCall() {
        long now = System.currentTimeMillis();
        long wait = MIN_INTERVAL_MS - (now - lastExternalCallMs);
        if (wait > 0) {
            try {
                Thread.sleep(wait);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        lastExternalCallMs = System.currentTimeMillis();
    }

    private List<GeocodeSuggestion> parsePhotonResponse(JsonNode body) {
        List<GeocodeSuggestion> results = new ArrayList<>();
        if (body == null || !body.has("features")) {
            return results;
        }
        for (JsonNode feature : body.get("features")) {
            if (results.size() >= MAX_SUGGESTIONS) {
                break;
            }
            JsonNode props = feature.path("properties");
            JsonNode coords = feature.path("geometry").path("coordinates");
            if (!coords.isArray() || coords.size() < 2) {
                continue;
            }
            double lon = coords.get(0).asDouble();
            double lat = coords.get(1).asDouble();
            String displayName = buildDisplayName(props);
            if (!displayName.isBlank()) {
                results.add(new GeocodeSuggestion(displayName, lat, lon));
            }
        }
        return results;
    }

    private String buildDisplayName(JsonNode props) {
        List<String> parts = new ArrayList<>();
        addPart(parts, props, "name");
        addPart(parts, props, "street");
        addPart(parts, props, "city");
        addPart(parts, props, "state");
        if (parts.isEmpty()) {
            return props.path("country").asText("");
        }
        return String.join(", ", parts);
    }

    private void addPart(List<String> parts, JsonNode props, String key) {
        String value = props.path(key).asText("");
        if (!value.isBlank() && parts.stream().noneMatch(p -> p.equalsIgnoreCase(value))) {
            parts.add(value);
        }
    }

    private record CacheEntry(List<GeocodeSuggestion> results, long expiresAt) {}
}
