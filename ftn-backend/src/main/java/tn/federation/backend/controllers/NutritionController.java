package tn.federation.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.federation.backend.entities.FoodEntry;
import tn.federation.backend.entities.NutritionPlan;
import tn.federation.backend.repositories.FoodEntryRepository;
import tn.federation.backend.services.NutritionService;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/nutrition")
public class NutritionController {

    @Autowired
    private NutritionService nutritionService;

    @Autowired
    private FoodEntryRepository foodEntryRepository;

    @GetMapping("/plan/{userId}")
    public ResponseEntity<NutritionPlan> getPlan(@PathVariable Long userId) {
        return ResponseEntity.ok(nutritionService.getOrGeneratePlan(userId));
    }

    @PostMapping("/food")
    public ResponseEntity<FoodEntry> addFoodEntry(@RequestBody FoodEntry entry) {
        if (entry.getEntryDate() == null) {
            entry.setEntryDate(LocalDate.now());
        }
        return ResponseEntity.ok(foodEntryRepository.save(entry));
    }

    @GetMapping("/food/{userId}/{date}")
    public ResponseEntity<List<FoodEntry>> getFoodByDate(
            @PathVariable Long userId,
            @PathVariable String date) {
        LocalDate parsedDate = LocalDate.parse(date);
        return ResponseEntity.ok(foodEntryRepository.findByUserIdAndEntryDateOrderByCreatedAtAsc(userId, parsedDate));
    }

    @GetMapping("/summary/{userId}/{date}")
    public ResponseEntity<Map<String, Object>> getDailySummary(
            @PathVariable Long userId,
            @PathVariable String date) {
        LocalDate parsedDate = LocalDate.parse(date);
        int totalCalories = foodEntryRepository.sumCaloriesByUserAndDate(userId, parsedDate);
        NutritionPlan plan = nutritionService.getOrGeneratePlan(userId);

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalCalories", totalCalories);
        summary.put("targetCalories", plan.getDailyCalories());
        summary.put("deficit", plan.getDailyCalories() - totalCalories);

        return ResponseEntity.ok(summary);
    }

    @DeleteMapping("/food/{id}")
    public ResponseEntity<Void> deleteFoodEntry(@PathVariable Long id) {
        foodEntryRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/food/{id}")
    public ResponseEntity<FoodEntry> updateFoodEntry(@PathVariable Long id, @RequestBody FoodEntry entry) {
        return foodEntryRepository.findById(id).map(existing -> {
            existing.setFoodName(entry.getFoodName());
            existing.setMealType(entry.getMealType());
            existing.setCalories(entry.getCalories());
            existing.setProtein(entry.getProtein());
            existing.setCarbs(entry.getCarbs());
            existing.setFat(entry.getFat());
            existing.setWaterMl(entry.getWaterMl());
            return ResponseEntity.ok(foodEntryRepository.save(existing));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/macros/{userId}/{date}")
    public ResponseEntity<Map<String, Object>> getDailyMacros(
            @PathVariable Long userId,
            @PathVariable String date) {
        LocalDate parsedDate = LocalDate.parse(date);
        NutritionPlan plan = nutritionService.getOrGeneratePlan(userId);

        Map<String, Object> macros = new HashMap<>();
        macros.put("calories", foodEntryRepository.sumCaloriesByUserAndDate(userId, parsedDate));
        macros.put("protein", foodEntryRepository.sumProteinByUserAndDate(userId, parsedDate));
        macros.put("carbs", foodEntryRepository.sumCarbsByUserAndDate(userId, parsedDate));
        macros.put("fat", foodEntryRepository.sumFatByUserAndDate(userId, parsedDate));
        macros.put("water", foodEntryRepository.sumWaterByUserAndDate(userId, parsedDate));
        
        macros.put("targetCalories", plan.getDailyCalories());
        macros.put("targetProtein", plan.getDailyProtein());
        macros.put("targetCarbs", plan.getDailyCarbs());
        macros.put("targetFat", plan.getDailyFat());
        macros.put("targetWater", plan.getDailyWater());

        return ResponseEntity.ok(macros);
    }

    @Autowired
    private tn.federation.backend.services.ServiceImpl.GeminiService geminiService;

    @PostMapping("/ai-recommendation")
    public ResponseEntity<Map<String, String>> getAiRecommendation(@RequestBody Map<String, Object> params) {
        String goal = (String) params.getOrDefault("goal", "MAINTENANCE");
        double weight = Double.parseDouble(params.getOrDefault("weight", "70").toString());
        double height = Double.parseDouble(params.getOrDefault("height", "175").toString());
        int age = Integer.parseInt(params.getOrDefault("age", "25").toString());
        String gender = (String) params.getOrDefault("gender", "M");
        
        int consumedCalories = Integer.parseInt(params.getOrDefault("consumedCalories", "0").toString());
        int targetCalories = Integer.parseInt(params.getOrDefault("targetCalories", "2500").toString());
        int consumedProtein = Integer.parseInt(params.getOrDefault("consumedProtein", "0").toString());
        int targetProtein = Integer.parseInt(params.getOrDefault("targetProtein", "120").toString());
        int consumedCarbs = Integer.parseInt(params.getOrDefault("consumedCarbs", "0").toString());
        int targetCarbs = Integer.parseInt(params.getOrDefault("targetCarbs", "300").toString());
        int trainingMinutes = Integer.parseInt(params.getOrDefault("trainingMinutes", "60").toString());
        int metValue = Integer.parseInt(params.getOrDefault("metValue", "8").toString());

        String recommendation = geminiService.generateNutritionRecommendation(
                goal, weight, height, age, gender,
                consumedCalories, targetCalories, consumedProtein, targetProtein,
                consumedCarbs, targetCarbs, trainingMinutes, metValue
        );

        Map<String, String> response = new HashMap<>();
        response.put("recommendation", recommendation);
        return ResponseEntity.ok(response);
    }
}
