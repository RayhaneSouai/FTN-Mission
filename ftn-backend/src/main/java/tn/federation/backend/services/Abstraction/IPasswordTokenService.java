package tn.federation.backend.services.Abstraction;

import tn.federation.backend.entities.AccountToken;
import tn.federation.backend.entities.TokenPurpose;

public interface IPasswordTokenService {
    String createToken(String email, TokenPurpose purpose, long validityHours);

    AccountToken requireValidToken(String rawToken);

    void markTokenUsed(AccountToken token);

    void invalidateActiveTokens(String email, TokenPurpose purpose);
}
