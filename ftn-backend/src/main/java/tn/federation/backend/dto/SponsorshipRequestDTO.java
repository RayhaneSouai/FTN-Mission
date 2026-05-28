package tn.federation.backend.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import tn.federation.backend.entities.SponsorshipType;

public class SponsorshipRequestDTO {

    @NotNull(message = "Le nageur est obligatoire")
    private Long swimmerId;

    @NotBlank(message = "Le nom du sponsor est obligatoire")
    private String nomSponsor;

    private String entreprise;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Email invalide")
    private String email;

    @NotBlank(message = "Le téléphone est obligatoire")
    private String telephone;

    private SponsorshipType typeSponsor;

    @Positive(message = "Le montant doit être positif")
    private Double montant;

    @Size(max = 5000)
    private String message;

    private String details;

    public Long getSwimmerId() {
        return swimmerId;
    }

    public void setSwimmerId(Long swimmerId) {
        this.swimmerId = swimmerId;
    }

    public String getNomSponsor() {
        return nomSponsor;
    }

    public void setNomSponsor(String nomSponsor) {
        this.nomSponsor = nomSponsor;
    }

    public String getEntreprise() {
        return entreprise;
    }

    public void setEntreprise(String entreprise) {
        this.entreprise = entreprise;
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

    public SponsorshipType getTypeSponsor() {
        return typeSponsor;
    }

    public void setTypeSponsor(SponsorshipType typeSponsor) {
        this.typeSponsor = typeSponsor;
    }

    public Double getMontant() {
        return montant;
    }

    public void setMontant(Double montant) {
        this.montant = montant;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }
}