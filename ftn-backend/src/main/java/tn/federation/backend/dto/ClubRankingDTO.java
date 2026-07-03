package tn.federation.backend.dto;

public record ClubRankingDTO(
        Long id,
        String name,
        String region,
        long swimmerCount
) {}
