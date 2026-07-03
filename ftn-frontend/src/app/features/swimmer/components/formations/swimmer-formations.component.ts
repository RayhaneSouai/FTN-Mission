import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormationRegistration } from '../../../formation/models/formation.model';
import { FormationProgramService } from '../../../formation/services/formation-program.service';
import {
  isFormationFullyCompleted,
  registrationStatusLabel
} from '../../../formation/utils/formation-registration.util';

@Component({
  selector: 'app-swimmer-formations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './swimmer-formations.component.html',
  styleUrl: './swimmer-formations.component.css'
})
export class SwimmerFormationsComponent implements OnInit {
  registrations: FormationRegistration[] = [];
  loading = true;
  errorMessage = '';
  downloadingRegistrationId: number | null = null;

  constructor(private formationService: FormationProgramService) {}

  ngOnInit(): void {
    this.formationService.getMyRegistrations().subscribe({
      next: (registrations) => {
        this.registrations = registrations;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger vos formations. Veuillez vous reconnecter.';
        this.loading = false;
      }
    });
  }

  get upcoming(): FormationRegistration[] {
    return this.registrations.filter((item) => item.phase === 'UPCOMING');
  }

  get ongoing(): FormationRegistration[] {
    return this.registrations.filter((item) => item.phase === 'ONGOING');
  }

  get completed(): FormationRegistration[] {
    return this.registrations.filter((item) => item.phase === 'COMPLETED');
  }

  statusLabel(status: string): string {
    return registrationStatusLabel(status);
  }

  programMeta(item: FormationRegistration): string {
    const program = item.program;
    const category = program.targetCategory || program.brevetType || 'Formation';
    return `${category} / ${program.season?.label ?? 'Saison'}`;
  }

  canDownloadCertificate(item: FormationRegistration): boolean {
    return item.status === 'APPROVED'
      && item.phase === 'COMPLETED'
      && isFormationFullyCompleted(item.program);
  }

  downloadCertificate(item: FormationRegistration): void {
    if (!this.canDownloadCertificate(item) || this.downloadingRegistrationId) {
      return;
    }
    this.downloadingRegistrationId = item.id;
    this.formationService.downloadCertificate(item.id).subscribe({
      next: (blob) => {
        const safeTitle = (item.program.title || 'formation').replace(/[/\\:*?"<>|]+/g, '-').trim();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `certificat-formation-${safeTitle}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.downloadingRegistrationId = null;
      },
      error: () => {
        this.errorMessage = 'Impossible de télécharger le certificat.';
        this.downloadingRegistrationId = null;
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
