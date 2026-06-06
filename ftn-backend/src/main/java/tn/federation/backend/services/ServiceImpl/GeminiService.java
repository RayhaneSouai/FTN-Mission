package tn.federation.backend.services.ServiceImpl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${gemini.api.key:}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    /**
     * Extrait le texte d'un fichier PDF en utilisant Apache PDFBox.
     */
    public String extractPdfText(String filePath) {
        try {
            File pdfFile = new File(filePath);
            if (!pdfFile.exists()) return null;
            try (org.apache.pdfbox.pdmodel.PDDocument doc =
                     org.apache.pdfbox.Loader.loadPDF(pdfFile)) {
                org.apache.pdfbox.text.PDFTextStripper stripper = new org.apache.pdfbox.text.PDFTextStripper();
                String text = stripper.getText(doc);
                return text.length() > 8000 ? text.substring(0, 8000) + "..." : text;
            }
        } catch (Exception e) {
            System.err.println("Erreur extraction PDF: " + e.getMessage());
            return null;
        }
    }

    /**
     * Génère un résumé IA spécifique pour un communiqué PDF.
     */
    public String generatePdfSummary(String title, String pdfText) {
        if (pdfText == null || pdfText.trim().isEmpty()) {
            return generateSummary(title, null, null, null);
        }

        if (apiKey == null || apiKey.isEmpty()) {
            String preview = pdfText.length() > 400 ? pdfText.substring(0, 400) + "..." : pdfText;
            return "<ul><li><b>Points clés du communiqué (Mode Hors-Ligne) :</b></li><li>"
                    + preview.replace("\n", "</li><li>") + "</li></ul>";
        }

        try {
            String urlWithKey = GEMINI_URL + "?key=" + apiKey;
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String prompt = "Tu es un assistant expert de la Fédération Tunisienne de Natation (FTN).\n"
                    + "Voici le contenu extrait d'un communiqué officiel PDF :\n\n"
                    + "Titre : " + title + "\n"
                    + "Contenu du PDF :\n" + pdfText + "\n\n"
                    + "Génère un résumé clair et professionnel sous forme de points (bullet points HTML <ul><li>). "
                    + "Mets en avant les informations les plus importantes : décisions, dates, personnes concernées, mesures prises. "
                    + "Retourne UNIQUEMENT la balise <ul> avec des <li>. Ton professionnel et concis.";

            Map<String, Object> requestBody = new HashMap<>();
            List<Map<String, Object>> contents = new ArrayList<>();
            Map<String, Object> contentMap = new HashMap<>();
            List<Map<String, Object>> parts = new ArrayList<>();
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", prompt);
            parts.add(textPart);
            contentMap.put("parts", parts);
            contents.add(contentMap);
            requestBody.put("contents", contents);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.exchange(urlWithKey, HttpMethod.POST, request, Map.class);

            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> contentBlock = (Map<String, Object>) candidates.get(0).get("content");
                    List<Map<String, Object>> resParts = (List<Map<String, Object>>) contentBlock.get("parts");
                    if (!resParts.isEmpty()) {
                        String result = (String) resParts.get(0).get("text");
                        return result.replace("```html", "").replace("```", "").trim();
                    }
                }
            }
            return "<i>Impossible de générer le résumé IA.</i>";
        } catch (Exception e) {
            e.printStackTrace();
            return "<div style=\"padding:15px; background:#fee2e2; color:#991b1b; border-radius:8px;\">Erreur IA : " + e.getMessage() + "</div>";
        }
    }

    public String generateSummary(String title, String summary, String content, String linkUrl) {
        if (apiKey == null || apiKey.isEmpty()) {
            String shortContent = "Aucun contenu disponible.";
            if (content != null && !content.isEmpty()) {
                shortContent = content.length() > 150 ? content.substring(0, 150) + "..." : content;
            } else if (summary != null && !summary.isEmpty()) {
                shortContent = summary;
            }
            return "<ul><li><b>Résumé rapide (Mode Hors-Ligne) :</b></li><li>" + shortContent + "</li></ul>";
        }

        try {
            String urlWithKey = GEMINI_URL + "?key=" + apiKey;
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String prompt = "Tu es un expert assistant IA intégré à l'application de la Fédération Tunisienne de Natation (FTN).\n"
                    + "Agis comme si tu avais lu et analysé en profondeur la source originale.\n\n"
                    + "Données disponibles :\n"
                    + "- Titre : " + (title != null ? title : "N/A") + "\n"
                    + "- Lien Source : " + (linkUrl != null ? linkUrl : "N/A") + "\n"
                    + "- Résumé original : " + (summary != null ? summary : "N/A") + "\n"
                    + "- Contenu texte : " + (content != null ? content : "N/A") + "\n\n"
                    + "Génère une description très courte sous forme de points (bullet points). "
                    + "Retourne uniquement une balise <ul> contenant quelques <li> très concis. Ton professionnel et sportif.";

            Map<String, Object> requestBody = new HashMap<>();
            List<Map<String, Object>> contents = new ArrayList<>();
            Map<String, Object> contentMap = new HashMap<>();
            List<Map<String, Object>> parts = new ArrayList<>();
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", prompt);
            parts.add(textPart);
            contentMap.put("parts", parts);
            contents.add(contentMap);
            requestBody.put("contents", contents);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.exchange(urlWithKey, HttpMethod.POST, request, Map.class);

            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> contentBlock = (Map<String, Object>) candidates.get(0).get("content");
                    List<Map<String, Object>> resParts = (List<Map<String, Object>>) contentBlock.get("parts");
                    if (!resParts.isEmpty()) {
                        String result = (String) resParts.get(0).get("text");
                        return result.replace("```html", "").replace("```", "").trim();
                    }
                }
            }
            return "Erreur lors de la lecture de la réponse Gemini.";

        } catch (Exception e) {
            e.printStackTrace();
            return "<div style=\"padding:15px; background:#fee2e2; color:#991b1b; border-radius:8px;\">"
                   + "Erreur lors de la communication avec l'API Gemini : " + e.getMessage() + "</div>";
        }
    }
}
