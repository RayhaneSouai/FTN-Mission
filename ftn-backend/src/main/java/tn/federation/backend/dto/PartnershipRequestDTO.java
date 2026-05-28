package tn.federation.backend.dto;

import jakarta.validation.constraints.NotBlank;
import tn.federation.backend.entities.PartnershipRequestStatus;
import tn.federation.backend.entities.PartnershipType;

public class PartnershipRequestDTO {

    @NotBlank
    private String nomRepresentant;

    @NotBlank
    private String adresse;

    @NotBlank
    private String contact;

    @NotBlank
    private String matriculeFiscale;

    private PartnershipType typePartenariat;

    public String getNomRepresentant() {
        return nomRepresentant;
    }

    public void setNomRepresentant(String nomRepresentant) {
        this.nomRepresentant = nomRepresentant;
    }

    public String getAdresse() {
        return adresse;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public String getContact() {
        return contact;
    }

    public void setContact(String contact) {
        this.contact = contact;
    }

    public String getMatriculeFiscale() {
        return matriculeFiscale;
    }

    public void setMatriculeFiscale(String matriculeFiscale) {
        this.matriculeFiscale = matriculeFiscale;
    }

    public PartnershipType getTypePartenariat() {
        return typePartenariat;
    }

    public void setTypePartenariat(PartnershipType typePartenariat) {
        this.typePartenariat = typePartenariat;
    }
}

