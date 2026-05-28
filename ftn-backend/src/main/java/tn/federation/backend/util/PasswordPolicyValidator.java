package tn.federation.backend.util;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Component
public class PasswordPolicyValidator {
    private static final int MIN_LENGTH = 8;
    private static final Pattern UPPER = Pattern.compile("[A-Z]");
    private static final Pattern LOWER = Pattern.compile("[a-z]");
    private static final Pattern DIGIT = Pattern.compile("[0-9]");
    private static final Pattern SPECIAL = Pattern.compile("[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]");

    public void validate(String password) {
        List<String> errors = collectErrors(password);
        if (!errors.isEmpty()) {
            throw new IllegalArgumentException(String.join(" ", errors));
        }
    }

    public List<String> collectErrors(String password) {
        List<String> errors = new ArrayList<>();
        if (password == null || password.length() < MIN_LENGTH) {
            errors.add("Le mot de passe doit contenir au moins " + MIN_LENGTH + " caractères.");
        }
        if (password != null) {
            if (!UPPER.matcher(password).find()) {
                errors.add("Au moins une majuscule est requise.");
            }
            if (!LOWER.matcher(password).find()) {
                errors.add("Au moins une minuscule est requise.");
            }
            if (!DIGIT.matcher(password).find()) {
                errors.add("Au moins un chiffre est requis.");
            }
            if (!SPECIAL.matcher(password).find()) {
                errors.add("Au moins un caractère spécial est requis.");
            }
        }
        return errors;
    }
}
