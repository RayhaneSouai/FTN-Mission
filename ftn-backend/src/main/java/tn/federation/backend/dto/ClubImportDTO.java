package tn.federation.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ClubImportDTO {

    private String name;
    private String region;
    private String address;
    private String contact;
    private String manager;
    private String affiliationDate; // Format attendu : yyyy-MM-dd
}