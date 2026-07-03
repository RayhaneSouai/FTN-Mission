package tn.federation.backend.dto;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
public class ImportResult {

    private int successCount = 0;
    private int failedCount = 0;
    private String message = "Import terminé";
    private List<String> errors = new ArrayList<>();

    // Constructeur par défaut
    public ImportResult() {}

    // Constructeur avec paramètres (pour les cas d'erreur rapide)
    public ImportResult(int successCount, int failedCount, String message) {
        this.successCount = successCount;
        this.failedCount = failedCount;
        this.message = message;
    }

    public void incrementSuccess() {
        successCount++;
    }

    public void incrementFailed() {
        failedCount++;
    }

    public void addError(String error) {
        errors.add(error);
    }
}