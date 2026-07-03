import { Component, OnInit } from '@angular/core';
import { FormationCertificate } from '../../../formation/models/formation.model';
import { FormationProgramService } from '../../../formation/services/formation-program.service';
import { isFormationFullyCompleted } from '../../../formation/utils/formation-registration.util';

@Component({
  selector: 'app-swimmer-formation-certificates',
  templateUrl: './swimmer-formation-certificates.component.html',
  styleUrl: '../formations/swimmer-formations.component.css'
})
export class SwimmerFormationCertificatesComponent implements OnInit {
  certificates: FormationCertificate[] = [];
  verifiedCertificate: FormationCertificate | null = null;
  verificationCode = '';
  loading = true;
  errorMessage = '';
  verificationMessage = '';
  downloadingCertificateId: number | null = null;

  constructor(private formationService: FormationProgramService) {}

  ngOnInit(): void {
    this.formationService.getMyCertificates().subscribe({
      next: (certificates) => {
        this.certificates = certificates;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger vos certificats.';
        this.loading = false;
      }
    });
  }

  downloadCertificate(certificate: FormationCertificate): void {
    if (!certificate.registrationId || !this.canDownloadCertificate(certificate) || this.downloadingCertificateId) {
      return;
    }
    this.downloadingCertificateId = certificate.id;
    this.formationService.downloadCertificate(certificate.registrationId).subscribe({
      next: (blob) => {
        const safeTitle = (certificate.program.title || 'formation').replace(/[/\\:*?"<>|]+/g, '-').trim();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `certificat-formation-${safeTitle}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.downloadingCertificateId = null;
      },
      error: () => {
        this.errorMessage = 'Impossible de télécharger le certificat.';
        this.downloadingCertificateId = null;
      }
    });
  }

  canDownloadCertificate(certificate: FormationCertificate): boolean {
    return !!certificate.registrationId && isFormationFullyCompleted(certificate.program);
  }

  verifyCertificate(): void {
    const code = this.verificationCode.trim();
    this.verifiedCertificate = null;
    this.verificationMessage = '';
    if (!code) {
      return;
    }

    this.formationService.verifyCertificate(code).subscribe({
      next: (certificate) => {
        this.verifiedCertificate = certificate;
        this.verificationMessage = 'Certificat vérifié avec succès.';
      },
      error: () => {
        this.verificationMessage = 'Aucun certificat trouvé pour ce code.';
      }
    });
  }

  formatDate(value?: string): string {
    if (!value) return 'À confirmer';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(value));
  }
}
