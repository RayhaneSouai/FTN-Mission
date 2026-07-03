package tn.federation.backend.services.ServiceImpl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import tn.federation.backend.dto.FormationEligibilityResponse;
import tn.federation.backend.entities.FormationProgram;
import tn.federation.backend.entities.User;
import tn.federation.backend.repositories.FormationProgramRepository;
import tn.federation.backend.repositories.UserRepository;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @deprecated Superseded by {@link AiService} (Gemini-backed), wired through
 * {@link tn.federation.backend.controllers.EligibilityController}. No controller
 * calls this anymore — kept only pending a cleanup PR that removes the Claude
 * dependency entirely.
 */
@Deprecated
@Service
public class EligibilityService {

    @Value("${claude.api.key:}")
    private String claudeApiKey;

    private static final String CLAUDE_URL = "https://api.anthropic.com/v1/messages";
    private static final String CLAUDE_MODEL = "claude-haiku-4-5-20251001";
    private static final String ANTHROPIC_VERSION = "2023-06-01";

    private final RestTemplate restTemplate = new RestTemplate();
    private final FormationProgramRepository programRepository;
    private final UserRepository userRepository;

    public EligibilityService(FormationProgramRepository programRepository, UserRepository userRepository) {
        this.programRepository = programRepository;
        this.userRepository = userRepository;
    }

    public FormationEligibilityResponse check(Long programId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur introuvable"));
        FormationProgram program = programRepository.findById(programId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Formation introuvable"));

        if (claudeApiKey == null || claudeApiKey.isBlank()) {
            return new FormationEligibilityResponse(true,
                    "Service IA non configuré — la vérification manuelle sera effectuée par l'administration.");
        }

        try {
            String prompt = buildPrompt(program, user);
            String rawResponse = callClaude(prompt);
            return parseResponse(rawResponse);
        } catch (Exception e) {
            return new FormationEligibilityResponse(false,
                    "Erreur lors de la vérification IA : " + e.getMessage());
        }
    }

    private String buildPrompt(FormationProgram program, User user) {
        StringBuilder sb = new StringBuilder();
        sb.append("Tu es l'assistant IA de la Fédération Tunisienne de Natation (FTN).\n");
        sb.append("Analyse l'éligibilité du candidat suivant pour la formation indiquée.\n\n");

        sb.append("PROFIL DU CANDIDAT :\n");
        sb.append("- Nom : ").append(user.getFirstName()).append(" ").append(user.getLastName()).append("\n");
        sb.append("- Rôle : ").append(user.getRole()).append("\n");
        if (user.getNiveau() != null) {
            sb.append("- Niveau de compétition : ").append(user.getNiveau()).append("\n");
        }
        if (user.getDiscipline() != null) {
            sb.append("- Discipline : ").append(user.getDiscipline()).append("\n");
        }
        if (user.getAnciennete() != null) {
            sb.append("- Ancienneté : ").append(user.getAnciennete()).append(" ans\n");
        }
        if (user.getBirthDate() != null) {
            sb.append("- Date de naissance : ").append(user.getBirthDate()).append("\n");
        }

        sb.append("\nFORMATION CIBLE :\n");
        sb.append("- Titre : ").append(program.getTitle()).append("\n");
        sb.append("- Brevet visé : ").append(program.getBrevetType()).append("\n");
        if (program.getRegistrationConditions() != null && !program.getRegistrationConditions().isBlank()) {
            sb.append("- Conditions d'inscription : ").append(program.getRegistrationConditions()).append("\n");
        }
        if (program.getRegistrationEndDate() != null) {
            sb.append("- Date limite d'inscription : ").append(program.getRegistrationEndDate()).append("\n");
        }

        sb.append("\nINSTRUCTION STRICTE :\n");
        sb.append("Réponds OBLIGATOIREMENT en commençant par exactement \"ELIGIBLE\" ou \"NON_ELIGIBLE\" sur la première ligne.\n");
        sb.append("Puis donne une explication concise en 2 à 3 phrases en français.\n");
        sb.append("Ne mets aucun formatage markdown, pas de titres, pas de listes.");

        return sb.toString();
    }

    @SuppressWarnings("unchecked")
    private String callClaude(String prompt) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", claudeApiKey);
        headers.set("anthropic-version", ANTHROPIC_VERSION);

        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", prompt);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", CLAUDE_MODEL);
        requestBody.put("max_tokens", 512);
        requestBody.put("messages", List.of(message));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
        ResponseEntity<Map> response = restTemplate.exchange(CLAUDE_URL, HttpMethod.POST, request, Map.class);

        Map<String, Object> body = response.getBody();
        if (body != null && body.containsKey("content")) {
            List<Map<String, Object>> content = (List<Map<String, Object>>) body.get("content");
            if (!content.isEmpty()) {
                return (String) content.get(0).get("text");
            }
        }
        return "NON_ELIGIBLE\nImpossible d'obtenir une réponse du service IA.";
    }

    private FormationEligibilityResponse parseResponse(String raw) {
        if (raw == null || raw.isBlank()) {
            return new FormationEligibilityResponse(false, "Réponse vide du service IA.");
        }
        String trimmed = raw.trim();
        if (trimmed.startsWith("ELIGIBLE")) {
            String explanation = trimmed.substring("ELIGIBLE".length()).trim();
            if (explanation.startsWith("\n")) explanation = explanation.substring(1).trim();
            return new FormationEligibilityResponse(true, explanation.isBlank() ? "Vous êtes éligible à cette formation." : explanation);
        } else if (trimmed.startsWith("NON_ELIGIBLE")) {
            String explanation = trimmed.substring("NON_ELIGIBLE".length()).trim();
            if (explanation.startsWith("\n")) explanation = explanation.substring(1).trim();
            return new FormationEligibilityResponse(false, explanation.isBlank() ? "Vous n'êtes pas éligible à cette formation." : explanation);
        }
        return new FormationEligibilityResponse(false, trimmed);
    }
}
