package tn.federation.backend.dto;

import tn.federation.backend.entities.Role;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class UserDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private Role role;
    private Boolean active;
    private LocalDate birthDate;
    private String gender;
    private String niveau;
    private String discipline;
    private Integer anciennete;
    private String registrationStatus;
    private LocalDateTime createdAt;
    
    // Club related fields
    private Long clubId;
    private String clubName;
    private String clubRegion;
    private String clubManager;
    private String clubContact;
    private LocalDate clubAffiliationDate;

    public Long getClubId() { return clubId; }
    public void setClubId(Long clubId) { this.clubId = clubId; }

    public String getClubName() { return clubName; }
    public void setClubName(String clubName) { this.clubName = clubName; }

    public String getClubRegion() { return clubRegion; }
    public void setClubRegion(String clubRegion) { this.clubRegion = clubRegion; }

    public String getClubManager() { return clubManager; }
    public void setClubManager(String clubManager) { this.clubManager = clubManager; }

    public String getClubContact() { return clubContact; }
    public void setClubContact(String clubContact) { this.clubContact = clubContact; }

    public LocalDate getClubAffiliationDate() { return clubAffiliationDate; }
    public void setClubAffiliationDate(LocalDate clubAffiliationDate) { this.clubAffiliationDate = clubAffiliationDate; }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getRegistrationStatus() {
        return registrationStatus;
    }

    public void setRegistrationStatus(String registrationStatus) {
        this.registrationStatus = registrationStatus;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public LocalDate getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getNiveau() {
        return niveau;
    }

    public void setNiveau(String niveau) {
        this.niveau = niveau;
    }

    public String getDiscipline() {
        return discipline;
    }

    public void setDiscipline(String discipline) {
        this.discipline = discipline;
    }

    public Integer getAnciennete() {
        return anciennete;
    }

    public void setAnciennete(Integer anciennete) {
        this.anciennete = anciennete;
    }
}
