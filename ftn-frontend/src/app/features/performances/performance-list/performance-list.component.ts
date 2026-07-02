import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PerformanceService } from '../../../core/services/performance.service';
import {
  PerformanceResponse,
  PerformanceRequest,
  STROKE_LABELS
} from '../../../core/models/performance.model';

@Component({
  selector: 'app-performance-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './performance-list.component.html',
  styleUrls: ['./performance-list.component.scss'],
})
export class PerformanceListComponent implements OnInit {

  private readonly service = inject(PerformanceService);

  // LIST
  performances = signal<PerformanceResponse[]>([]);
  loading = signal(false);

  // FORM STATE
  showForm = signal(false);
  isEditMode = signal(false);

  selectedId: number | null = null;

  form: PerformanceRequest = {
    swimmerId: 0,
    distance: 100,
    stroke: 'LIBRE',
    time: 0,
    date: new Date().toISOString().split('T')[0],
  };

  strokes = ['LIBRE', 'DOS', 'BRASSE', 'PAPILLON', 'QUATRE_NAGES'];
  strokeLabels = STROKE_LABELS;
  distances = [50, 100, 200, 400, 800, 1500];

  ngOnInit(): void {
    this.load();
  }

  // ======================
  // LIST
  // ======================
  load(): void {
    this.loading.set(true);

    this.service.getAll().subscribe({
      next: (data) => {
        this.performances.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  // ======================
  // OPEN CREATE FORM
  // ======================
  openCreate(): void {
    this.isEditMode.set(false);
    this.selectedId = null;

    this.form = {
      swimmerId: 0,
      distance: 100,
      stroke: 'LIBRE',
      time: 0,
      date: new Date().toISOString().split('T')[0],
    };

    this.showForm.set(true);
  }

  // ======================
  // OPEN EDIT FORM
  // ======================
  openEdit(p: PerformanceResponse): void {
    this.isEditMode.set(true);
    this.selectedId = p.id;

    this.form = {
      swimmerId: p.swimmerId,
      distance: p.distance,
      stroke: p.stroke,
      time: p.time,
      date: p.date,
    };

    this.showForm.set(true);
  }

  // ======================
  // SAVE (CREATE / UPDATE)
  // ======================
  save(): void {
    if (this.isEditMode() && this.selectedId) {
      this.service.update(this.selectedId, this.form).subscribe(() => {
        this.afterSave();
      });
    } else {
      this.service.create(this.form).subscribe(() => {
        this.afterSave();
      });
    }
  }

  afterSave(): void {
    this.showForm.set(false);
    this.load();
  }

  // ======================
  // DELETE
  // ======================
  delete(id: number): void {
    if (!confirm('Confirmer suppression ?')) return;

    this.service.delete(id).subscribe(() => {
      this.load();
    });
  }

  closeForm(): void {
    this.showForm.set(false);
  }
}
