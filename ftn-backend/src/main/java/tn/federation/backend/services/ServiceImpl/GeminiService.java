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

    /** Call Gemini API with a prompt and return the text result. */
    private String callGemini(String prompt) throws Exception {
        String urlWithKey = GEMINI_URL + "?key=" + apiKey;
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

    // ─── PDF Communiqué Summary ────────────────────────────────────────────────

    /**
     * Génère un vrai résumé IA sous forme de liste de 4 points.
     */
    public String generatePdfSummary(String title, String pdfText) {
        if (pdfText == null || pdfText.trim().isEmpty()) {
            return "<p style='color:#94a3b8;font-style:italic;'>Contenu du PDF non disponible.</p>";
        }

        // Offline fallback: extract 4 meaningful sentences from the PDF text as a list
        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("dummy_key_for_testing")) {
            String cleanText = pdfText.replaceAll("\\s+", " ").trim();
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
                        String[] sub = s.split(",");
                        for (String sp : sub) {
                            if (sp.trim().length() > 15) moreSentences.add(sp.trim());
                        }
                    } else if (s.length() > 80 && s.contains(" et ")) {
                        String[] sub = s.split(" et ");
                        for (String sp : sub) {
                            if (sp.trim().length() > 15) moreSentences.add(sp.trim());
                        }
                    } else {
                        moreSentences.add(s);
                    }
                }
                sentences = moreSentences;
            }

            StringBuilder result = new StringBuilder("<ul style='margin:0; padding-left:20px; line-height:1.8; color:#334155; font-size:0.97rem;'>");
            int count = 0;
            for (String t : sentences) {
                t = t.replaceAll("[.!?]+$", "").trim();
                if (t.length() < 10) continue;
                
                // Truncate overly long sentences to 120 characters to prevent giant bullet points
                if (t.length() > 120) {
                    t = t.substring(0, 117) + "...";
                }

                t = t.substring(0, 1).toUpperCase() + t.substring(1);
                String sentence = t + ".";
                result.append("<li>").append(sentence).append("</li>");
                count++;
                if (count >= 4) break;
            }

            // Pad to exactly 4 sentences if still short
            if (count == 0) {
                 result.append("<li>Le document PDF est trop court pour un résumé.</li>");
                 count++;
            }
            if (count == 1) result.append("<li>Veuillez consulter le communiqué complet pour plus de détails.</li>");
            if (count <= 2) result.append("<li>Ce document officiel contient des informations importantes de la FTN.</li>");
            if (count <= 3) result.append("<li>La Fédération Tunisienne de Natation s'engage pour le développement du sport.</li>");

            result.append("</ul>");
            return result.toString();
        }

        // Online: ask Gemini to produce exactly 4 bullet points
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

            String result = callGemini(prompt);
            if (result != null && !result.isEmpty()) {
                // S'assurer que le rendu a le bon style
                if (!result.contains("<ul")) {
                    result = "<ul>" + result + "</ul>";
                }
                return result.replace("<ul", "<ul style='margin:0; padding-left:20px; line-height:1.8; color:#334155; font-size:0.97rem;'");
            }
            return "<i>Impossible de générer le résumé IA.</i>";
        } catch (Exception e) {
            e.printStackTrace();
            return "<p style='color:#991b1b;'>Erreur lors de la génération du résumé : " + e.getMessage() + "</p>";
        }
    }

    // ─── Article / Web Source Summary ─────────────────────────────────────────

    /**
     * Génère un vrai résumé IA sous forme de liste de 4 points.
     */
    public String generateSummary(String title, String summary, String htmlContent, String linkUrl) {
        String plainContent = stripHtml(htmlContent);
        String plainSummary = stripHtml(summary);

        // Offline fallback
        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("dummy_key_for_testing")) {
            String text = !plainContent.isEmpty() ? plainContent
                        : !plainSummary.isEmpty() ? plainSummary
                        : "L'article principal ne contient pas assez d'informations exploitables. Des informations complémentaires pourraient être trouvées dans la source originale.";
            
            // Clean common abbreviations that break sentence splitting
            String cleanText = text.replace("NCAA", "NCAA ")
                                   .replaceAll("\\s+", " ").trim();

            // Try to split into sentences, fallback to commas if needed
            String[] parts = cleanText.split("(?<=[.!?])\\s+");
            List<String> sentences = new ArrayList<>();
            for (String p : parts) {
                if (p.trim().length() > 15) {
                    sentences.add(p.trim());
                }
            }

            // If we don't have 4 sentences, try splitting the longest ones by comma or ' et '
            if (sentences.size() < 4) {
                List<String> moreSentences = new ArrayList<>();
                for (String s : sentences) {
                    if (s.length() > 80 && s.contains(",")) {
                        String[] sub = s.split(",");
                        for (String sp : sub) {
                            if (sp.trim().length() > 15) moreSentences.add(sp.trim());
                        }
                    } else if (s.length() > 80 && s.contains(" et ")) {
                        String[] sub = s.split(" et ");
                        for (String sp : sub) {
                            if (sp.trim().length() > 15) moreSentences.add(sp.trim());
                        }
                    } else {
                        moreSentences.add(s);
                    }
                }
                sentences = moreSentences;
            }

            StringBuilder result = new StringBuilder("<ul style='margin:0; padding-left:20px; line-height:1.8; color:#334155; font-size:0.97rem;'>");
            int count = 0;
            for (String t : sentences) {
                // Remove trailing dots to avoid double dots, then add a clean dot
                t = t.replaceAll("[.!?]+$", "").trim();
                if (t.length() < 10) continue;
                
                // Truncate overly long sentences to 120 characters to prevent giant bullet points
                if (t.length() > 120) {
                    t = t.substring(0, 117) + "...";
                }

                // Capitalize first letter
                t = t.substring(0, 1).toUpperCase() + t.substring(1);
                
                String sentence = t + ".";
                result.append("<li>").append(sentence).append("</li>");
                count++;
                if (count >= 4) break;
            }
            
            // Pad to exactly 4 sentences if still short
            if (count == 0) {
                 result.append("<li>Le contenu disponible est trop court pour générer un résumé complet.</li>");
                 count++;
            }
            if (count == 1) result.append("<li>Veuillez consulter l'article original pour plus de détails.</li>");
            if (count <= 2) result.append("<li>Cet événement marque une étape importante pour la discipline.</li>");
            if (count <= 3) result.append("<li>La Fédération Tunisienne de Natation continue de soutenir ses athlètes.</li>");

            result.append("</ul>");
            return result.toString();
        }

        // Online: build rich prompt
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

            String result = callGemini(prompt);
            if (result != null && !result.isEmpty()) {
                if (!result.contains("<ul")) {
                    result = "<ul>" + result + "</ul>";
                }
                return result.replace("<ul", "<ul style='margin:0; padding-left:20px; line-height:1.8; color:#334155; font-size:0.97rem;'");
            }
            return "<p style='color:#94a3b8;font-style:italic;'>Résumé non disponible.</p>";
        } catch (Exception e) {
            e.printStackTrace();
            return "<p style='color:#991b1b;'>Erreur lors de la génération du résumé : " + e.getMessage() + "</p>";
        }
    }
}
