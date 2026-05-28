package tn.federation.backend.util;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class SecurePasswordGenerator {
    private static final String UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    private static final String LOWER = "abcdefghijkmnopqrstuvwxyz";
    private static final String DIGITS = "23456789";
    private static final String SPECIAL = "!@#$%&*-_+=?";
    private static final String ALL = UPPER + LOWER + DIGITS + SPECIAL;
    private static final int DEFAULT_LENGTH = 14;

    private final SecureRandom random = new SecureRandom();

    public String generate() {
        return generate(DEFAULT_LENGTH);
    }

    public String generate(int length) {
        if (length < 12) {
            length = 12;
        }
        char[] password = new char[length];
        password[0] = pick(UPPER);
        password[1] = pick(LOWER);
        password[2] = pick(DIGITS);
        password[3] = pick(SPECIAL);
        for (int i = 4; i < length; i++) {
            password[i] = pick(ALL);
        }
        shuffle(password);
        return new String(password);
    }

    private char pick(String source) {
        return source.charAt(random.nextInt(source.length()));
    }

    private void shuffle(char[] array) {
        for (int i = array.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            char tmp = array[i];
            array[i] = array[j];
            array[j] = tmp;
        }
    }
}
