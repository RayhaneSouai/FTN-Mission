package tn.federation.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("FTN Backend API")
                        .description("Fédération Tunisienne de Natation - API de gestion des nageurs, licences et compétitions")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Support FTN")
                                .email("support@ftn.tn")
                        )
                );
    }
}
