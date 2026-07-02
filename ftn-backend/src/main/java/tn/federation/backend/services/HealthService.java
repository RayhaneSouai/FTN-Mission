package tn.federation.backend.services;

import org.springframework.stereotype.Service;
import tn.federation.backend.entities.WellnessEntry;
import tn.federation.backend.repositories.FoodEntryRepository;
import tn.federation.backend.repositories.WellnessEntryRepository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
public class HealthService {

    private final WellnessEntryRepository wellnessRepository;
    private final FoodEntryRepository foodEntryRepository;

    public HealthService(WellnessEntryRepository wellnessRepository, FoodEntryRepository foodEntryRepository) {
        this.wellnessRepository = wellnessRepository;
        this.foodEntryRepository = foodEntryRepository;
    }

    /**
     * Moteur de corrélation basique :
     * Vérifie si le nageur est en déficit calorique continu et a un faible score de bien-être.
     */
    public List<String> generateAlerts(Long userId) {
        List<String> alerts = new ArrayList<>();
        LocalDate today = LocalDate.now();
        
        // Check last 3 days of wellness
        List<WellnessEntry> recentWellness = wellnessRepository.findTop7ByUserIdOrderByEntryDateDesc(userId);
        
        long lowScoreDays = recentWellness.stream()
                .filter(w -> w.getOverallScore() < 2.5)
                .count();

        if (lowScoreDays >= 2) {
            alerts.add("ALERTE ROUGE : Votre score de bien-être est très bas depuis plusieurs jours. Risque de surentraînement ou maladie.");
        } else if (lowScoreDays == 1) {
            alerts.add("ATTENTION : Légère fatigue détectée. Surveillez votre récupération.");
        }

        // Check if there are active injuries
        // (In a real implementation, we would query InjuryRecordRepository)

        // Check caloric deficit over last 3 days
        int totalDeficitDays = 0;
        for (int i = 0; i < 3; i++) {
            LocalDate d = today.minusDays(i);
            int calories = foodEntryRepository.sumCaloriesByUserAndDate(userId, d);
            if (calories > 0 && calories < 2000) { // arbitrary threshold for the example
                totalDeficitDays++;
            }
        }

        if (totalDeficitDays >= 3) {
            alerts.add("ALERTE NUTRITION : Déficit calorique prolongé détecté (3 jours). Risque accru de blessure musculaire.");
        }

        if (alerts.isEmpty()) {
            alerts.add("OK : Vos voyants sont au vert !");
        }

        return alerts;
    }
}
