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
import tn.federation.backend.services.press.IPressService;

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

    @Operation(summary = "Télécharger une image")
    @PostMapping("/upload")
    public Map<String, String> uploadFile(@RequestParam("file") MultipartFile file) {
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

    @Operation(summary = "Extraire les métadonnées d'une URL")
    @GetMapping("/extract")
    public Map<String, String> extractMetadata(@RequestParam String url) {
        Map<String, String> metadata = new HashMap<>();
        try {
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0")
                    .timeout(10000)
                    .get();

            // Extraction du titre
            String title = doc.title();
            Element ogTitle = doc.selectFirst("meta[property=og:title]");
            if (ogTitle != null) title = ogTitle.attr("content");
            metadata.put("title", title);

            // Extraction du contenu (Description)
            String description = "";
            Element ogDesc = doc.selectFirst("meta[property=og:description]");
            if (ogDesc != null) description = ogDesc.attr("content");
            else {
                Element metaDesc = doc.selectFirst("meta[name=description]");
                if (metaDesc != null) description = metaDesc.attr("content");
            }
            metadata.put("content", description);

            // Extraction de l'image
            String image = "";
            Element ogImage = doc.selectFirst("meta[property=og:image]");
            if (ogImage != null) image = ogImage.attr("content");
            metadata.put("image", image);

        } catch (Exception e) {
            metadata.put("error", "Impossible d'extraire les données : " + e.getMessage());
        }
        return metadata;
    }

    @Operation(summary = "Récupérer tous les articles de presse")
    @GetMapping("/getAll")
    public List<PressItem> getAll() {
        return pressService.getAll();
    }

    @Operation(summary = "Récupérer un article par son ID")
    @GetMapping("/get/{id}")
    public PressItem getById(@PathVariable long id) {
        return pressService.getPressItemById(id);
    }

    @Operation(summary = "Récupérer les articles par type (ARTICLE, VIDEO, PHOTO, COMMUNIQUE)")
    @GetMapping("/getByType/{type}")
    public List<PressItem> getByType(@PathVariable PressType type) {
        return pressService.getByType(type);
    }

    @Operation(summary = "Récupérer les articles par type et discipline")
    @GetMapping("/getByTypeAndDiscipline/{type}/{discipline}")
    public List<PressItem> getByTypeAndDiscipline(
            @PathVariable PressType type,
            @PathVariable String discipline) {
        return pressService.getByTypeAndDiscipline(type, discipline);
    }

    @Operation(summary = "Récupérer les médias enfants d'un article parent")
    @GetMapping("/getMedia/{parentId}")
    public List<PressItem> getMedia(@PathVariable long parentId) {
        return pressService.getMediaByParent(parentId);
    }

    @Operation(summary = "Ajouter un nouvel article (statut DRAFT par défaut)")
    @PostMapping("/add")
    public PressItem add(@RequestBody PressItem pressItem) {
        return pressService.addPressItem(pressItem);
    }

    @Operation(summary = "Modifier un article existant")
    @PutMapping("/update/{id}")
    public PressItem update(@PathVariable long id, @RequestBody PressItem pressItem) {
        pressItem.setIdPressItem(id); // On s'assure que l'ID est bien celui de l'URL
        return pressService.updatePressItem(pressItem);
    }

    @Operation(summary = "Publier un article (statut → PUBLISHED)")
    @PutMapping("/publish/{id}")
    public PressItem publish(@PathVariable long id) {
        return pressService.publish(id);
    }

    @Operation(summary = "Archiver un article (statut → ARCHIVED)")
    @PutMapping("/archive/{id}")
    public PressItem archive(@PathVariable long id) {
        return pressService.archive(id);
    }

    @Operation(summary = "Supprimer un article par son ID")
    @DeleteMapping("/delete/{id}")
    public void delete(@PathVariable long id) {
        pressService.deletePressItem(id);
    }
}
