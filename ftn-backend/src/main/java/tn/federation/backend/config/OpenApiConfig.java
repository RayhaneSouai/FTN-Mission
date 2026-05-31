package tn.federation.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    public static final String BEARER_AUTH = "bearerAuth";

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("FTN Backend API")
                        .description("""
                                Fédération Tunisienne de Natation — API REST.

                                **Authentification (endpoints admin)** :
                                1. `POST /api/auth/login` avec `admin@ftn.tn` / `admin123`
                                2. Copier le champ `token` de la réponse
                                3. Cliquer **Authorize** (cadenas) et saisir : `Bearer <votre_token>`
                                """)
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Support FTN")
                                .email("support@ftn.tn")))
                .addSecurityItem(new SecurityRequirement().addList(BEARER_AUTH))
                .components(new Components()
                        .addSecuritySchemes(BEARER_AUTH, new SecurityScheme()
                                .name(BEARER_AUTH)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("JWT obtenu via POST /api/auth/login")));
    }
}
