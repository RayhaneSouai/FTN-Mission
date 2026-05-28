package tn.federation.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import tn.federation.backend.config.AppSecurityProperties;

@SpringBootApplication
@EnableConfigurationProperties(AppSecurityProperties.class)
@org.springframework.scheduling.annotation.EnableScheduling
public class FtnBackendApplication {
    public static void main(String[] args) {
        SpringApplication.run(FtnBackendApplication.class, args);
    }
}
