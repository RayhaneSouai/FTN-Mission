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
import tn.federation.backend.services.ServiceImpl.GeminiService;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import org.springframework.web.multipart.MultipartFile;

import tn.federation.backend.dto.PressInteractionDTO;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/press")
@Tag(name = "Press", description = "Gestion des articles de presse (CRUD + publication/archivage)")
public class PressController {

    private final IPressService pressService;
    private final GeminiService geminiService;

    public PressController(IPressService pressService, GeminiService geminiService) {
        this.pressService = pressService;
        this.geminiService = geminiService;
    }

    private final Path root = Paths.get("uploads");

    // =====================================================================
    // GESTION DES FICHIERS (Upload / Affichage)
    // =====================================================================

    @Operation(summary = "Télécharger une image")
    @PostMapping(value = "/upload", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> uploadFile(@RequestParam("file") MultipartFile file) {
        log.info("Tentative d'upload de fichier: {}", file.getOriginalFilename());
        Map<String, String> response = new HashMap<>();
        try {
            if (!Files.exists(root)) {
                Files.createDirectories(root);
                log.info("Dossier 'uploads' créé.");
            }
            // Nettoyer le nom de fichier pour éviter les virgules et espaces problématiques
            String cleanName = file.getOriginalFilename() != null ? 
                file.getOriginalFilename().replaceAll("[,; ]+", "_") : "file";
            
            String filename = UUID.randomUUID().toString() + "_" + cleanName;
            Files.copy(file.getInputStream(), this.root.resolve(filename));
            log.info("Fichier enregistré sous: {}", filename);
            response.put("url", "/api/press/images/" + filename);
        } catch (Exception e) {
            log.error("Erreur upload: {}", e.getMessage());
            response.put("error", "Erreur upload: " + e.getMessage());
        }
        return response;
    }

    @GetMapping("/images/{filename:.+}")
    public org.springframework.http.ResponseEntity<org.springframework.core.io.Resource> getImage(@PathVariable String filename) {
        return serveFile(filename, false);
    }

    @Operation(summary = "Télécharger un fichier (PDF, document)")
    @GetMapping("/download/{filename:.+}")
    public org.springframework.http.ResponseEntity<org.springframework.core.io.Resource> downloadFile(@PathVariable String filename) {
        return serveFile(filename, true);
    }

    private org.springframework.http.ResponseEntity<org.springframework.core.io.Resource> serveFile(String filename, boolean asAttachment) {
        try {
            org.springframework.core.io.Resource file = new org.springframework.core.io.UrlResource(root.resolve(filename).toUri());
            if (file.exists() || file.isReadable()) {
                String mimeType = Files.probeContentType(root.resolve(filename));
                if (mimeType == null) mimeType = "application/octet-stream";
                var builder = org.springframework.http.ResponseEntity.ok()
                        .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, mimeType);
                if (asAttachment) {
                    String displayName = filename.contains("_")
                            ? filename.substring(filename.indexOf('_') + 1)
                            : filename;
                    builder.header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + displayName + "\"");
                }
                return builder.body(file);
            } else {
                return org.springframework.http.ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.internalServerError().build();
        }
    }

    // =====================================================================
    // EXTRACTION DE METADONNEES
    // =====================================================================

    @Operation(summary = "Extraire titre et image depuis un lien externe")
    @GetMapping("/fetch-metadata")
    public Map<String, String> fetchMetadata(@RequestParam String url) {
        log.info("Extraction pour URL: {}", url);
        Map<String, String> metadata = new HashMap<>();
        try {
            // 1. Initialiser avec l'URL originale
            metadata.put("sourceUrl", url);

            // 2. Traitement spécial YouTube
            if (url.contains("youtube.com") || url.contains("youtu.be")) {
                log.info("Détection YouTube");
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

            // 3. Connexion avec Jsoup en ignorant les erreurs SSL (PKIX path building failed)
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36")
                    .timeout(15000)
                    .sslSocketFactory(createTrustAllSSLSocketFactory())
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

            log.info("Extraction réussie - Titre: {}", metadata.get("title"));
        } catch (Exception e) {
            log.error("Erreur d'extraction pour {} : {}", url, e.getMessage());
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

    @Operation(summary = "Obtenir les articles favoris d'un nageur")
    @GetMapping("/favorites/{userId}")
    public org.springframework.http.ResponseEntity<List<PressItem>> getFavoritesByUserId(@PathVariable Long userId) {
        return org.springframework.http.ResponseEntity.ok(pressService.getFavoritesByUserId(userId));
    }

    @Operation(summary = "Obtenir les articles épinglés d'un nageur")
    @GetMapping("/pins/{userId}")
    public org.springframework.http.ResponseEntity<List<PressItem>> getPinsByUserId(@PathVariable Long userId) {
        return org.springframework.http.ResponseEntity.ok(pressService.getPinsByUserId(userId));
    }

    @Operation(summary = "Obtenir les interactions (commentaires, réactions, favoris) d'un article")
    @GetMapping("/{id}/interactions")
    public org.springframework.http.ResponseEntity<PressInteractionDTO> getInteractions(
            @PathVariable long id, 
            @RequestParam(required = false) Long userId) {
        return org.springframework.http.ResponseEntity.ok(pressService.getInteractions(id, userId));
    }

    @Operation(summary = "Générer un résumé IA (Gemini) d'un article")
    @GetMapping(value = "/{id}/claude-summary", produces = "text/html;charset=UTF-8")
    public String generateSummary(@PathVariable("id") Long id) {
        PressItem item = pressService.getPressItemById(id);
        if (item == null) {
            return "<i>Article introuvable pour générer un résumé.</i>";
        }
        return geminiService.generateSummary(item.getTitle(), item.getSummary(), item.getContent(), item.getLinkUrl());
    }

    @Operation(summary = "Générer un résumé IA du contenu PDF d'un communiqué")
    @GetMapping(value = "/{id}/pdf-summary", produces = "text/html;charset=UTF-8")
    public String generatePdfSummary(@PathVariable("id") Long id) {
        PressItem item = pressService.getPressItemById(id);
        if (item == null) return "<i>Article introuvable.</i>";

        String pdfUrl = null;
        if (item.getDocuments() != null && !item.getDocuments().isEmpty()) {
            pdfUrl = item.getDocuments().split(",")[0].trim();
        } else if (item.getMediaUrl() != null && (item.getMediaUrl().endsWith(".pdf") || item.getMediaUrl().contains("upload"))) {
            pdfUrl = item.getMediaUrl();
        } else if (item.getLinkUrl() != null && item.getLinkUrl().endsWith(".pdf")) {
            pdfUrl = item.getLinkUrl();
        }

        String pdfText = null;
        if (pdfUrl != null) {
            String filename = pdfUrl.substring(pdfUrl.lastIndexOf('/') + 1);
            String localPath = "uploads/" + filename;
            log.info("PDF path: {}", localPath);
            pdfText = geminiService.extractPdfText(localPath);
        }
        // Fallback to article text content if PDF not readable
        if (pdfText == null && item.getContent() != null) pdfText = item.getContent();
        if (pdfText == null && item.getSummary() != null) pdfText = item.getSummary();

        return geminiService.generatePdfSummary(item.getTitle(), pdfText);
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

    @Operation(summary = "Ajouter/Supprimer une épingle (Pin)")
    @PostMapping("/{id}/pin")
    public org.springframework.http.ResponseEntity<?> togglePin(
            @PathVariable long id, 
            @RequestParam Long userId) {
        try {
            pressService.togglePin(id, userId);
            return org.springframework.http.ResponseEntity.ok().build();
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.internalServerError().body("Erreur Pin: " + e.getMessage());
        }
    }

    // =====================================================================
    // UTILITAIRE: SSLSocketFactory (Trust All pour Jsoup)
    // =====================================================================
    private static javax.net.ssl.SSLSocketFactory createTrustAllSSLSocketFactory() {
        try {
            javax.net.ssl.TrustManager[] trustAllCerts = new javax.net.ssl.TrustManager[]{
                new javax.net.ssl.X509TrustManager() {
                    public java.security.cert.X509Certificate[] getAcceptedIssuers() { return null; }
                    public void checkClientTrusted(java.security.cert.X509Certificate[] certs, String authType) { }
                    public void checkServerTrusted(java.security.cert.X509Certificate[] certs, String authType) { }
                }
            };
            javax.net.ssl.SSLContext sc = javax.net.ssl.SSLContext.getInstance("SSL");
            sc.init(null, trustAllCerts, new java.security.SecureRandom());
            return sc.getSocketFactory();
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la création de la socket SSL", e);
        }
    }
}
