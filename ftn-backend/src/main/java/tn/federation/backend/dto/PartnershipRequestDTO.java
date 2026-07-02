package tn.federation.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import tn.federation.backend.entities.PartnershipType;

public class PartnershipRequestDTO {

    @NotBlank(message = "Le nom de l'entreprise est obligatoire")
    private String nomEntreprise;

    @NotBlank(message = "Le nom du représentant est obligatoire")
    private String nomRepresentant;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Email invalide")
    private String email;

    @NotBlank(message = "Le téléphone est obligatoire")
    private String telephone;

    @NotBlank(message = "L'adresse est obligatoire")
    private String adresse;

    private String siteWeb;

    private String matriculeFiscale;

    @Size(max = 5000)
    private String message;

    private PartnershipType typePartenariat;

    // === NEW Advanced Fields ===
    @Size(max = 2000, message = "La proposition ne doit pas dépasser 2000 caractères")
    private String proposition;

    @Size(max = 1500, message = "La valeur ajoutée ne doit pas dépasser 1500 caractères")
    private String addedValue;

    @PositiveOrZero(message = "Le budget proposé doit être positif")
    private Double proposedBudget;

    private Long targetCompetitionId;

    private String targetClub;

    // === Getters & Setters (Existing + New) ===

    public String getNomEntreprise() {
        return nomEntreprise;
    }

    public void setNomEntreprise(String nomEntreprise) {
        this.nomEntreprise = nomEntreprise;
    }

    public String getNomRepresentant() {
        return nomRepresentant;
    }

    public void setNomRepresentant(String nomRepresentant) {
        this.nomRepresentant = nomRepresentant;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public String getAdresse() {
        return adresse;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public String getSiteWeb() {
        return siteWeb;
    }

    public void setSiteWeb(String siteWeb) {
        this.siteWeb = siteWeb;
    }

    public String getMatriculeFiscale() {
        return matriculeFiscale;
    }

    public void setMatriculeFiscale(String matriculeFiscale) {
        this.matriculeFiscale = matriculeFiscale;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public PartnershipType getTypePartenariat() {
        return typePartenariat;
    }

    public void setTypePartenariat(PartnershipType typePartenariat) {
        this.typePartenariat = typePartenariat;
    }

    // New Getters & Setters
    public String getProposition() {
        return proposition;
    }

    public void setProposition(String proposition) {
        this.proposition = proposition;
    }

    public String getAddedValue() {
        return addedValue;
    }

    public void setAddedValue(String addedValue) {
        this.addedValue = addedValue;
    }

    public Double getProposedBudget() {
        return proposedBudget;
    }

    public void setProposedBudget(Double proposedBudget) {
        this.proposedBudget = proposedBudget;
    }

    public Long getTargetCompetitionId() {
        return targetCompetitionId;
    }

    public void setTargetCompetitionId(Long targetCompetitionId) {
        this.targetCompetitionId = targetCompetitionId;
    }

    public String getTargetClub() {
        return targetClub;
    }

    public void setTargetClub(String targetClub) {
        this.targetClub = targetClub;
    }
}