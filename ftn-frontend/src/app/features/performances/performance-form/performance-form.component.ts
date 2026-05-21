import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PerformanceService } from '../../../core/services/performance.service';
import { PerformanceRequest, STROKE_LABELS } from '../../../core/models/performance.model';

@Component({
  selector: 'app-performance-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './performance-form.component.html',
  styleUrls: ['./performance-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerformanceFormComponent {
  readonly Math = Math;
  private readonly performanceService = inject(PerformanceService);

  readonly strokeLabels = STROKE_LABELS;
  readonly strokes = ['LIBRE', 'DOS', 'BRASSE', 'PAPILLON', 'QUATRE_NAGES'];
  readonly distances = [50, 100, 200, 400, 800, 1500];

  form: PerformanceRequest = {
    swimmerId: 0,
    distance: 100,
    stroke: 'LIBRE',
    time: 0,
    date: new Date().toISOString().split('T')[0],
  };

  loading = signal(false);
  success = signal(false);
  error = signal<string | null>(null);

  submit(): void {
    if (!this.form.swimmerId || !this.form.time || !this.form.date) {
      this.error.set('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.success.set(false);

    this.performanceService.create(this.form).subscribe({
      next: () => {
        this.success.set(true);
        this.loading.set(false);
        this.resetForm();
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Erreur lors de l\'enregistrement.');
        this.loading.set(false);
      },
    });
  }

  resetForm(): void {
    this.form = {
      swimmerId: 0,
      distance: 100,
      stroke: 'LIBRE',
      time: 0,
      date: new Date().toISOString().split('T')[0],
    };
  }
}
