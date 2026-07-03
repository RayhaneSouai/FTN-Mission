package tn.federation.backend.services.ServiceImpl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
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
    private static final String GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models/";
    private static final String[] GEMINI_MODELS = {
            "gemini-2.5-flash",
            "gemini-2.0-flash"
    };

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

    // ─── Helpers ───────────────────────────────────────────────────────────────

    /** Strip HTML tags and collapse whitespace to get plain text. */
    private String stripHtml(String html) {
        if (html == null) return "";
        return html
            .replaceAll("<[^>]*>", " ")
            .replaceAll("&nbsp;", " ")
            .replaceAll("&amp;", "&")
            .replaceAll("&lt;", "<")
            .replaceAll("&gt;", ">")
            .replaceAll("&quot;", "\"")
            .replaceAll("\\s+", " ")
            .trim();
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank() && !"dummy_key_for_testing".equals(apiKey);
    }

    /** Call Gemini API with a prompt and return the text result, or null if the key is missing. */
    public String generateText(String prompt) throws Exception {
        if (!isConfigured()) {
            return null;
        }
        return callGemini(prompt);
    }

    /** Call Gemini API with a prompt. Retries on overload, falls back across models. */
    private String callGemini(String prompt) throws Exception {
        Exception lastError = null;
        for (String model : GEMINI_MODELS) {
            for (int attempt = 0; attempt < 2; attempt++) {
                try {
                    if (attempt > 0) {
                        Thread.sleep(900L * attempt);
                    }
                    String result = callGeminiModel(prompt, model);
                    if (result != null && !result.isBlank()) {
                        return result;
                    }
                    lastError = new IllegalStateException("Réponse vide pour le modèle " + model);
                } catch (Exception e) {
                    lastError = e;
                    if (isModelNotFound(e)) {
                        break;
                    }
                    if (isTransientError(e) && attempt == 0) {
                        continue;
                    }
                    if (isTransientError(e)) {
                        break;
                    }
                    throw e;
                }
            }
        }
        throw lastError != null ? lastError : new IllegalStateException("Service Gemini indisponible.");
    }

    private String callGeminiModel(String prompt, String model) throws Exception {
        String urlWithKey = GEMINI_BASE + model + ":generateContent?key=" + apiKey;
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", prompt);
        List<Map<String, Object>> parts = new ArrayList<>();
        parts.add(textPart);
        Map<String, Object> contentMap = new HashMap<>();
        contentMap.put("parts", parts);
        List<Map<String, Object>> contents = new ArrayList<>();
        contents.add(contentMap);
        Map<String, Object> requestBody = new HashMap<>();
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
        return null;
    }

    private boolean isModelNotFound(Exception e) {
        if (e instanceof HttpStatusCodeException http) {
            return http.getStatusCode().value() == 404;
        }
        String msg = e.getMessage() != null ? e.getMessage().toLowerCase() : "";
        return msg.contains("not found") && msg.contains("404");
    }

    private boolean isTransientError(Exception e) {
        if (e instanceof HttpStatusCodeException http) {
            int code = http.getStatusCode().value();
            return code == 503 || code == 429 || code == 500 || code == 502;
        }
        String msg = e.getMessage() != null ? e.getMessage().toLowerCase() : "";
        return msg.contains("503")
                || msg.contains("429")
                || msg.contains("unavailable")
                || msg.contains("high demand")
                || msg.contains("resource exhausted");
    }

    private String formatGeminiHtmlList(String result) {
        if (result == null || result.isEmpty()) {
            return null;
        }
        if (!result.contains("<ul")) {
            result = "<ul>" + result + "</ul>";
        }
        return result.replace("<ul", "<ul style='margin:0; padding-left:20px; line-height:1.8; color:#334155; font-size:0.97rem;'");
    }

    /** Offline bullet summary when Gemini is unavailable or fails. */
    private String buildOfflineSummaryFromText(String rawText) {
        if (rawText == null || rawText.isBlank()) {
            return "<p style='color:#94a3b8;font-style:italic;'>Contenu insuffisant pour générer un résumé.</p>";
        }

        String cleanText = rawText.replace("NCAA", "NCAA ").replaceAll("\\s+", " ").trim();
        String[] parts = cleanText.split("(?<=[.!?])\\s+|\\n");
        List<String> sentences = new ArrayList<>();
        for (String s : parts) {
            String t = s.trim();
            if (t.length() < 15) continue;
            if (t.matches(".*\\d+/\\d+.*") || t.startsWith("©") || t.startsWith("www.")) continue;
            sentences.add(t);
        }

        if (sentences.size() < 4) {
            List<String> moreSentences = new ArrayList<>();
            for (String s : sentences) {
                if (s.length() > 80 && s.contains(",")) {
                    for (String sp : s.split(",")) {
                        if (sp.trim().length() > 15) moreSentences.add(sp.trim());
                    }
                } else if (s.length() > 80 && s.contains(" et ")) {
                    for (String sp : s.split(" et ")) {
                        if (sp.trim().length() > 15) moreSentences.add(sp.trim());
                    }
                } else {
                    moreSentences.add(s);
                }
            }
            sentences = moreSentences;
        }

        StringBuilder result = new StringBuilder(
                "<ul style='margin:0; padding-left:20px; line-height:1.8; color:#334155; font-size:0.97rem;'>");
        int count = 0;
        for (String t : sentences) {
            t = t.replaceAll("[.!?]+$", "").trim();
            if (t.length() < 10) continue;
            if (t.length() > 120) {
                t = t.substring(0, 117) + "...";
            }
            t = t.substring(0, 1).toUpperCase() + t.substring(1);
            result.append("<li>").append(t).append(".</li>");
            count++;
            if (count >= 4) break;
        }
        if (count == 0) {
            result.append("<li>Le contenu disponible est trop court pour un résumé complet.</li>");
            count++;
        }
        if (count == 1) result.append("<li>Veuillez consulter la source originale pour plus de détails.</li>");
        if (count <= 2) result.append("<li>Cet événement marque une étape importante pour la discipline.</li>");
        if (count <= 3) result.append("<li>La Fédération Tunisienne de Natation continue de soutenir ses athlètes.</li>");
        result.append("</ul>");
        return result.toString();
    }

    // ─── PDF Communiqué Summary ────────────────────────────────────────────────

    /**
     * Génère un vrai résumé IA sous forme de liste de 4 points.
     */
    public String generatePdfSummary(String title, String pdfText) {
        if (pdfText == null || pdfText.trim().isEmpty()) {
            return "<p style='color:#94a3b8;font-style:italic;'>Contenu du PDF non disponible.</p>";
        }

        if (!isConfigured()) {
            return buildOfflineSummaryFromText(pdfText);
        }

        try {
            String cleanText = pdfText.replaceAll("\\s+", " ").trim();
            String prompt =
                "Tu es un assistant de la Fédération Tunisienne de Natation (FTN).\n\n" +
                "Voici le texte extrait d'un communiqué officiel :\n\n" +
                "\"" + cleanText + "\"\n\n" +
                "INSTRUCTION STRICTE :\n" +
                "- Écris EXACTEMENT une liste de 4 points (bullet points) résumant ce document.\n" +
                "- Chaque point doit être une phrase complète.\n" +
                "- Ne répète JAMAIS le titre du document ni la description mot pour mot.\n" +
                "- Ignore les mentions légales, numéros de page, en-têtes.\n" +
                "- Concentre-toi sur les informations nouvelles : qui, quoi, quand, décisions.\n" +
                "- Retourne UNIQUEMENT une liste HTML <ul> avec 4 <li>.\n" +
                "- Ne mets pas de titres, ni de balises ```html.";

            String result = formatGeminiHtmlList(callGemini(prompt));
            if (result != null) {
                return result;
            }
            return buildOfflineSummaryFromText(pdfText);
        } catch (Exception e) {
            System.err.println("Gemini PDF summary failed, offline fallback: " + e.getMessage());
            return buildOfflineSummaryFromText(pdfText);
        }
    }

    // ─── Article / Web Source Summary ─────────────────────────────────────────

    /**
     * Génère un vrai résumé IA sous forme de liste de 4 points.
     */
    public String generateSummary(String title, String summary, String htmlContent, String linkUrl) {
        String plainContent = stripHtml(htmlContent);
        String plainSummary = stripHtml(summary);

        // Offline fallback when API key is missing
        if (!isConfigured()) {
            String text = !plainContent.isEmpty() ? plainContent
                    : !plainSummary.isEmpty() ? plainSummary
                    : "L'article ne contient pas assez d'informations exploitables.";
            return buildOfflineSummaryFromText(text);
        }

        try {
            String contentForPrompt = !plainContent.isEmpty()
                ? plainContent.substring(0, Math.min(6000, plainContent.length()))
                : (!plainSummary.isEmpty() ? plainSummary : "");

            String sourceInfo = (linkUrl != null && !linkUrl.isEmpty() && !linkUrl.equals("N/A"))
                ? "Source URL : " + linkUrl + "\n" : "";

            String prompt =
                "Tu es un assistant de la Fédération Tunisienne de Natation (FTN).\n\n" +
                sourceInfo +
                "Voici le contenu complet de l'article :\n\n" +
                "\"" + contentForPrompt + "\"\n\n" +
                "INSTRUCTION STRICTE :\n" +
                "- Écris EXACTEMENT une liste de 4 points (bullet points) résumant cet article.\n" +
                "- Chaque point doit être une phrase complète.\n" +
                "- Ne répète JAMAIS le titre ni le résumé existant mot pour mot.\n" +
                "- Informe sur : les faits clés, les résultats, les événements.\n" +
                "- Retourne UNIQUEMENT une liste HTML <ul> avec 4 <li>.\n" +
                "- Ne mets pas de titres, ni de balises ```html.";

            String result = formatGeminiHtmlList(callGemini(prompt));
            if (result != null) {
                return result;
            }
            return buildOfflineSummaryFromText(!plainContent.isEmpty() ? plainContent : plainSummary);
        } catch (Exception e) {
            System.err.println("Gemini article summary failed, offline fallback: " + e.getMessage());
            return buildOfflineSummaryFromText(!plainContent.isEmpty() ? plainContent : plainSummary);
        }
    }
}
