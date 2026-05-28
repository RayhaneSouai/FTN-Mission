package tn.federation.backend.services.ServiceImpl;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.federation.backend.entities.AccountToken;
import tn.federation.backend.entities.TokenPurpose;
import tn.federation.backend.repositories.AccountTokenRepository;
import tn.federation.backend.services.Abstraction.IPasswordTokenService;

import java.time.Instant;
import java.util.UUID;

@Service
public class PasswordTokenServiceImpl implements IPasswordTokenService {
    private final AccountTokenRepository accountTokenRepository;

    public PasswordTokenServiceImpl(AccountTokenRepository accountTokenRepository) {
        this.accountTokenRepository = accountTokenRepository;
    }

    @Override
    @Transactional
    public String createToken(String email, TokenPurpose purpose, long validityHours) {
        invalidateActiveTokens(email, purpose);
        AccountToken token = new AccountToken();
        token.setToken(UUID.randomUUID().toString());
        token.setEmail(email.trim().toLowerCase());
        token.setPurpose(purpose);
        token.setExpiresAt(Instant.now().plusSeconds(validityHours * 3600));
        accountTokenRepository.save(token);
        return token.getToken();
    }

    @Override
    public AccountToken requireValidToken(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new IllegalArgumentException("Token invalide ou expiré.");
        }
        AccountToken token = accountTokenRepository.findByTokenAndUsedAtIsNull(rawToken.trim())
                .orElseThrow(() -> new IllegalArgumentException("Token invalide ou expiré."));
        if (token.isExpired()) {
            throw new IllegalArgumentException("Token invalide ou expiré.");
        }
        return token;
    }

    @Override
    @Transactional
    public void markTokenUsed(AccountToken token) {
        token.setUsedAt(Instant.now());
        accountTokenRepository.save(token);
    }

    @Override
    @Transactional
    public void invalidateActiveTokens(String email, TokenPurpose purpose) {
        accountTokenRepository.invalidateActiveTokens(email.trim().toLowerCase(), purpose, Instant.now());
    }
}
