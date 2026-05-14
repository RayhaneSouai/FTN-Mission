package tn.federation.backend.controllers.press;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import tn.federation.backend.entities.press.PressItem;
import tn.federation.backend.entities.press.PressType;
import tn.federation.backend.dto.press.PressStatsDTO;
import tn.federation.backend.services.press.Abstraction.IPressService;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/press")
@CrossOrigin("*")
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
    public Map<String, String> uploadFile(@RequestPart("file") MultipartFile file) {
        Map<String, String> response = new HashMap<>();
        try {
            if (!Files.exists(root)) Files.createDirectory(root);
            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Files.copy(file.getInputStream(), this.root.resolve(filename));
            response.put("url", "/api/press/images/" + filename);
        } catch (Exception e) {
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
        Map<String, String> metadata = new HashMap<>();
        try {
            // 1. Traitement spécial YouTube pour les miniatures
            if (url.contains("youtube.com") || url.contains("youtu.be")) {
                String videoId = "";
                if (url.contains("v=")) {
                    videoId = url.split("v=")[1].split("&")[0];
                } else if (url.contains("youtu.be/")) {
                    videoId = url.split("youtu.be/")[1].split("\\?")[0];
                }
                if (!videoId.isEmpty()) {
                    metadata.put("image", "https://img.youtube.com/vi/" + videoId + "/maxresdefault.jpg");
                }
            }

            // 2. Connexion avec User-Agent pour éviter d'être bloqué par les sites (ex: Kapitalis)
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
                    .timeout(10000)
                    .get();

            metadata.put("title", doc.title());

            // Contenu (OpenGraph ou standard)
            Element ogDesc = doc.select("meta[property=og:description]").first();
            metadata.put("content", ogDesc != null ? ogDesc.attr("content") : "");

            // Image (si pas déjà trouvée via YouTube)
            if (!metadata.containsKey("image")) {
                Element ogImage = doc.select("meta[property=og:image]").first();
                String image = "";
                if (ogImage != null) {
                    image = ogImage.attr("content");
                } else {
                    Element firstImg = doc.select("img[src~=(?i)\\.(png|jpe?g|webp)]").first();
                    if (firstImg != null) image = firstImg.absUrl("src");
                }
                metadata.put("image", image);
            }

        } catch (Exception e) {
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
}
