package tn.federation.backend.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import tn.federation.backend.entities.PressItem;
import tn.federation.backend.entities.PressType;
import tn.federation.backend.dto.PressStatsDTO;
import tn.federation.backend.services.Abstraction.IPressService;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import org.springframework.web.multipart.MultipartFile;

import tn.federation.backend.dto.PressInteractionDTO;

@RestController
@RequestMapping("/api/press")
@Tag(name = "Press", description = "Gestion des articles de presse (CRUD + publication/archivage)")
public class PressController {

    @Autowired
    IPressService pressService;

    private final Path root = Paths.get("uploads");

    // =====================================================================
    // GESTION DES FICHIERS (Upload / Affichage)
    // =====================================================================

    @Operation(summary = "Télécharger une image")
    @PostMapping(value = "/upload", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> uploadFile(@RequestParam("file") MultipartFile file) {
        System.out.println("DEBUG: Tentative d'upload de fichier: " + file.getOriginalFilename());
        Map<String, String> response = new HashMap<>();
        try {
            if (!Files.exists(root)) {
                Files.createDirectories(root);
                System.out.println("DEBUG: Dossier 'uploads' créé.");
            }
            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Files.copy(file.getInputStream(), this.root.resolve(filename));
            System.out.println("DEBUG: Fichier enregistré sous: " + filename);
            response.put("url", "/api/press/images/" + filename);
        } catch (Exception e) {
            System.err.println("DEBUG: Erreur upload: " + e.getMessage());
            response.put("error", "Erreur upload: " + e.getMessage());
        }
        return response;
    }

    @GetMapping("/images/{filename:.+}")
    public @ResponseBody byte[] getImage(@PathVariable String filename) throws Exception {
        return Files.readAllBytes(root.resolve(filename));
    }

    // =====================================================================
    // EXTRACTION DE METADONNEES
    // =====================================================================

    @Operation(summary = "Extraire titre et image depuis un lien externe")
    @GetMapping("/fetch-metadata")
    public Map<String, String> fetchMetadata(@RequestParam String url) {
        System.out.println("DEBUG: Extraction pour URL: " + url);
        Map<String, String> metadata = new HashMap<>();
        try {
            // 1. Initialiser avec l'URL originale
            metadata.put("sourceUrl", url);

            // 2. Traitement spécial YouTube
            if (url.contains("youtube.com") || url.contains("youtu.be")) {
                System.out.println("DEBUG: Détection YouTube");
                String videoId = "";
                if (url.contains("v=")) {
                    videoId = url.split("v=")[1].split("&")[0];
                } else if (url.contains("youtu.be/")) {
                    videoId = url.split("youtu.be/")[1].split("\\?")[0];
                }
                if (!videoId.isEmpty()) {
                    metadata.put("image", "https://img.youtube.com/vi/" + videoId + "/maxresdefault.jpg");
                    metadata.put("videoUrl", "https://www.youtube.com/watch?v=" + videoId);
                }
            }

            // 3. Connexion avec Jsoup
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36")
                    .timeout(10000)
                    .get();

            metadata.put("title", doc.title());

            // Contenu / Description (Plusieurs fallbacks)
            String content = "";
            Element ogDesc = doc.select("meta[property=og:description]").first();
            if (ogDesc != null) {
                content = ogDesc.attr("content");
            } else {
                Element metaDesc = doc.select("meta[name=description]").first();
                if (metaDesc != null) content = metaDesc.attr("content");
            }
            metadata.put("content", content);

            // Image (si pas déjà YouTube)
            if (!metadata.containsKey("image") || metadata.get("image").isEmpty()) {
                Element ogImage = doc.select("meta[property=og:image]").first();
                if (ogImage != null) {
                    metadata.put("image", ogImage.attr("content"));
                } else {
                    Element firstImg = doc.select("img[src~=(?i)\\.(png|jpe?g|webp)]").first();
                    if (firstImg != null) metadata.put("image", firstImg.absUrl("src"));
                }
            }

            System.out.println("DEBUG: Extraction réussie - Titre: " + metadata.get("title"));
        } catch (Exception e) {
            System.err.println("DEBUG: Erreur d'extraction pour " + url + " : " + e.getMessage());
            metadata.put("error", "Erreur extraction: " + e.getMessage());
        }
        return metadata;
    }

    // =====================================================================
    // LECTURE (GET)
    // =====================================================================

    @Operation(summary = "Liste complète des articles")
    @GetMapping("/getAll")
    public List<PressItem> getAll() {
        return pressService.getAll();
    }

    @Operation(summary = "Détails d'un article")
    @GetMapping("/get/{id}")
    public PressItem getById(@PathVariable long id) {
        return pressService.getPressItemById(id);
    }

    @Operation(summary = "Filtrer par type")
    @GetMapping("/getByType/{type}")
    public List<PressItem> getByType(@PathVariable PressType type) {
        return pressService.getByType(type);
    }

    @Operation(summary = "Stats globales du dashboard")
    @GetMapping("/stats")
    public PressStatsDTO getStats() {
        return pressService.getStats();
    }

    // =====================================================================
    // ECRITURE & MODIFICATION (POST / PUT)
    // =====================================================================

    @Operation(summary = "Ajouter un article")
    @PostMapping("/add")
    public PressItem add(@RequestBody PressItem pressItem) {
        return pressService.add(pressItem);
    }

    @Operation(summary = "Modifier un article")
    @PutMapping("/update/{id}")
    public PressItem update(@PathVariable long id, @RequestBody PressItem pressItem) {
        return pressService.update(id, pressItem);
    }

    @Operation(summary = "Publier un article")
    @PutMapping("/publish/{id}")
    public org.springframework.http.ResponseEntity<?> publish(@PathVariable long id) {
        try {
            return org.springframework.http.ResponseEntity.ok(pressService.publish(id));
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.internalServerError().body("Erreur Publication: " + e.getMessage());
        }
    }

    @Operation(summary = "Programmer un article")
    @PutMapping("/schedule/{id}")
    public org.springframework.http.ResponseEntity<?> schedule(@PathVariable long id, @RequestParam("scheduledAt") String scheduledAtStr) {
        try {
            java.time.LocalDateTime scheduledAt = java.time.LocalDateTime.parse(scheduledAtStr);
            return org.springframework.http.ResponseEntity.ok(pressService.schedule(id, scheduledAt));
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.internalServerError().body("Erreur Programmation: " + e.getMessage());
        }
    }

    @Operation(summary = "Incrémenter le compteur de vues")
    @PutMapping("/views/{id}")
    public void incrementViews(@PathVariable long id) {
        pressService.incrementViews(id);
    }

    @Operation(summary = "Incrémenter le compteur de téléchargements")
    @PutMapping("/downloads/{id}")
    public void incrementDownloads(@PathVariable long id) {
        pressService.incrementDownloads(id);
    }

    @Operation(summary = "Obtenir les articles les plus populaires")
    @GetMapping("/popular")
    public List<PressItem> getPopular(@RequestParam(defaultValue = "5") int limit) {
        return pressService.getPopular(limit);
    }

    @Operation(summary = "Archiver un article")
    @PutMapping("/archive/{id}")
    public org.springframework.http.ResponseEntity<?> archive(@PathVariable long id) {
        try {
            return org.springframework.http.ResponseEntity.ok(pressService.archive(id));
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.internalServerError().body("Erreur Archive: " + e.getMessage());
        }
    }

    @Operation(summary = "Remettre en brouillon / Restaurer")
    @PutMapping("/draft/{id}")
    public PressItem draft(@PathVariable long id) {
        return pressService.draft(id);
    }

    // =====================================================================
    // SUPPRESSION (DELETE)
    // =====================================================================

    @Operation(summary = "Supprimer (Corbeille ou Définitif)")
    @DeleteMapping("/delete/{id}")
    public org.springframework.http.ResponseEntity<?> delete(@PathVariable long id) {
        try {
            pressService.deletePressItem(id);
            return org.springframework.http.ResponseEntity.ok().build();
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.internalServerError().body("Erreur Delete: " + e.getMessage());
        }
    }

    // =====================================================================
    // INTERACTIONS (Commentaires, Réactions, Favoris)
    // =====================================================================

    @Operation(summary = "Obtenir les interactions (commentaires, réactions, favoris) d'un article")
    @GetMapping("/{id}/interactions")
    public org.springframework.http.ResponseEntity<PressInteractionDTO> getInteractions(
            @PathVariable long id, 
            @RequestParam(required = false) Long userId) {
        return org.springframework.http.ResponseEntity.ok(pressService.getInteractions(id, userId));
    }

    @Operation(summary = "Ajouter un commentaire")
    @PostMapping("/{id}/comment")
    public org.springframework.http.ResponseEntity<?> addComment(
            @PathVariable long id, 
            @RequestParam Long userId, 
            @RequestBody Map<String, String> payload) {
        try {
            pressService.addComment(id, userId, payload.get("text"));
            return org.springframework.http.ResponseEntity.ok().build();
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.internalServerError().body("Erreur Comment: " + e.getMessage());
        }
    }

    @Operation(summary = "Ajouter/Modifier/Supprimer une réaction")
    @PostMapping("/{id}/react")
    public org.springframework.http.ResponseEntity<?> toggleReaction(
            @PathVariable long id, 
            @RequestParam Long userId, 
            @RequestParam String type) {
        try {
            pressService.toggleReaction(id, userId, type);
            return org.springframework.http.ResponseEntity.ok().build();
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.internalServerError().body("Erreur Reaction: " + e.getMessage());
        }
    }

    @Operation(summary = "Ajouter/Supprimer un favori")
    @PostMapping("/{id}/favorite")
    public org.springframework.http.ResponseEntity<?> toggleFavorite(
            @PathVariable long id, 
            @RequestParam Long userId) {
        try {
            pressService.toggleFavorite(id, userId);
            return org.springframework.http.ResponseEntity.ok().build();
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.internalServerError().body("Erreur Favorite: " + e.getMessage());
        }
    }
}
