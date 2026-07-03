package tn.federation.backend.services.ServiceImpl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class FormationCertificateScheduler {

    private static final Logger LOGGER = LoggerFactory.getLogger(FormationCertificateScheduler.class);

    private final CertificateService certificateService;

    public FormationCertificateScheduler(CertificateService certificateService) {
        this.certificateService = certificateService;
    }

    /** Runs every day at 02:00 — generates certificates for completed approved formations. */
    @Scheduled(cron = "0 0 2 * * *")
    public void issueCompletedCertificatesDaily() {
        int issued = certificateService.issueCompletedCertificates();
        if (issued > 0) {
            LOGGER.info("Auto-issued {} formation certificate(s)", issued);
        }
    }
}
