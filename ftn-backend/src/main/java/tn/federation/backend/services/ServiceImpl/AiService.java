package tn.federation.backend.services.ServiceImpl;

import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import tn.federation.backend.dto.AiEligibilityResponse;
import tn.federation.backend.dto.FormationProgramDTO;
import tn.federation.backend.dto.UserDTO;

import java.time.LocalDate;
import java.time.Period;
import java.util.List;

@Service
public class AiService {

    private final GeminiService geminiService;

    public AiService(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    public AiEligibilityResponse checkEligibility(UserDTO swimmer, FormationProgramDTO program) {
        if (!geminiService.isConfigured()) {
            return AiEligibilityResponse.unconfigured();
        }
        try {
            String prompt = buildPrompt(swimmer, program);
            String raw = geminiService.generateText(prompt);
            if (raw == null || raw.isBlank()) {
                return AiEligibilityResponse.serviceError(
                        "Impossible d'obtenir une réponse du service IA. Réessayez dans quelques instants.");
            }
            return parse(raw);
        } catch (Exception e) {
            return AiEligibilityResponse.serviceError(friendlyErrorMessage(e));
        }
    }

    private String friendlyErrorMessage(Exception e) {
        if (e instanceof HttpStatusCodeException http) {
            return switch (http.getStatusCode().value()) {
                case 503, 502 -> "Le service IA est momentanément surchargé. Réessayez dans quelques instants.";
                case 429 -> "Trop de requêtes vers le service IA. Patientez un moment puis réessayez.";
                case 401, 403 -> "Clé API Gemini invalide ou non autorisée. Contactez l'administration.";
                default -> "Le service IA est temporairement indisponible. Réessayez plus tard.";
            };
        }
        String msg = e.getMessage() != null ? e.getMessage().toLowerCase() : "";
        if (msg.contains("503") || msg.contains("unavailable") || msg.contains("high demand")) {
            return "Le service IA est momentanément surchargé. Réessayez dans quelques instants.";
        }
        if (msg.contains("429") || msg.contains("resource exhausted")) {
            return "Trop de requêtes vers le service IA. Patientez un moment puis réessayez.";
        }
        return "Le service IA est temporairement indisponible. Réessayez plus tard.";
    }

    private String buildPrompt(UserDTO swimmer, FormationProgramDTO program) {
        String fullName = trim(swimmer.getFirstName()) + " " + trim(swimmer.getLastName());
        String role = swimmer.getRole() != null ? swimmer.getRole().name() : "Non renseigné";
        String niveau = orDefault(swimmer.getNiveau(), "Non renseigné");
        String anciennete = swimmer.getAnciennete() != null ? swimmer.getAnciennete() + " ans" : "Non renseignée";
        String certifications = formatCertifications(swimmer.getCertifications());
        String licenceActive = orDefault(swimmer.getLicenceActive(), "Non renseignée");
        String age = computeAge(swimmer.getBirthDate());

        String title = orDefault(program.getTitle(), "Non renseigné");
        String brevetType = orDefault(program.getBrevetType(), "Non renseigné");
        String conditions = orDefault(program.getRegistrationConditions(), "Aucune condition spécifiée");
        String fee = program.getRegistrationFee() != null ? program.getRegistrationFee().toPlainString() : "Non renseignés";
        String spots = program.getSpotsAvailable() != null ? program.getSpotsAvailable().toString() : "Non renseignées";

        return "Tu es un assistant de la Fédération Tunisienne de Natation.\n" +
               "Vérifie si ce nageur/candidat est éligible à cette formation.\n\n" +
               "Profil du candidat:\n" +
               "- Nom: " + fullName + "\n" +
               "- Rôle: " + role + "\n" +
               "- Niveau: " + niveau + "\n" +
               "- Ancienneté: " + anciennete + "\n" +
               "- Certifications obtenues: " + certifications + "\n" +
               "- Licence active: " + licenceActive + "\n" +
               "- Age: " + age + "\n\n" +
               "Programme de formation:\n" +
               "- Titre: " + title + "\n" +
               "- Type: " + brevetType + "\n" +
               "- Conditions: " + conditions + "\n" +
               "- Frais: " + fee + " TND\n" +
               "- Places disponibles: " + spots + "\n\n" +
               "Réponds en français avec:\n" +
               "1. Une décision claire: ÉLIGIBLE ou NON ÉLIGIBLE\n" +
               "2. Une explication de 2-3 phrases maximum\n" +
               "3. Si non éligible: une recommandation concrète\n\n" +
               "Sois concis et professionnel.";
    }

    private AiEligibilityResponse parse(String raw) {
        if (raw == null || raw.isBlank()) {
            return AiEligibilityResponse.serviceError("Réponse vide du service IA.");
        }
        String cleaned = raw.trim().replaceAll("\\*+", "");
        String upper = cleaned.toUpperCase();
        boolean eligible = upper.contains("ÉLIGIBLE") && !upper.contains("NON ÉLIGIBLE")
                && !upper.contains("NON_ÉLIGIBLE");
        String explanation = cleaned
                .replaceFirst("(?i)^D[ÉE]CISION\\s*:\\s*(NON\\s*)?[ÉE]LIGIBLE\\s*", "")
                .replaceFirst("(?i)^(NON[_ ])?[ÉE]LIGIBLE[\\s:.-]*", "")
                .trim();
        return new AiEligibilityResponse(eligible,
                explanation.isBlank() ? (eligible ? "Vous êtes éligible." : "Vous n'êtes pas éligible.") : explanation);
    }

    private String computeAge(LocalDate birthDate) {
        if (birthDate == null) return "Non renseigné";
        int age = Period.between(birthDate, LocalDate.now()).getYears();
        return age + " ans";
    }

    private String formatCertifications(List<String> certs) {
        if (certs == null || certs.isEmpty()) return "Aucune";
        return String.join(", ", certs);
    }

    private String orDefault(String value, String def) {
        return (value != null && !value.isBlank()) ? value : def;
    }

    private String trim(String value) {
        return value != null ? value.trim() : "";
    }
}
