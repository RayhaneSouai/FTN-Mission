import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecordService } from './services/record.service';
import { RecordDTO, STROKE_LABELS, GENDER_LABELS } from '../../core/models/performance.model';
import { PageHeroComponent } from '../../shared/components/page-hero/page-hero.component';
import { PAGE_HERO_IMAGES } from '../../shared/components/page-hero/page-hero.constants';

@Component({
  selector: 'app-records',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeroComponent],
  templateUrl: './records.component.html',
  styleUrls: ['./records.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordsComponent implements OnInit {
  readonly heroImage = PAGE_HERO_IMAGES.records;
  private readonly recordService = inject(RecordService);

  readonly strokeLabels = STROKE_LABELS;
  readonly genderLabels = GENDER_LABELS;

  records = signal<RecordDTO[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  filterGender = signal<string>('');
  filterStroke = signal<string>('');

  readonly strokes = ['', 'LIBRE', 'DOS', 'BRASSE', 'PAPILLON', 'QUATRE_NAGES'];
  readonly genders = ['', 'HOMME', 'FEMME'];

  readonly filtered = computed(() => {
    let result = this.records();
    if (this.filterGender()) result = result.filter(r => r.gender === this.filterGender());
    if (this.filterStroke()) result = result.filter(r => r.stroke === this.filterStroke());
    return result;
  });

  ngOnInit(): void {
    this.recordService.getAllNationalRecords().subscribe({
      next: (data) => { this.records.set(data); this.loading.set(false); },
      error: () => { this.error.set('Erreur lors du chargement des records.'); this.loading.set(false); },
    });
  }

  formatTime(time: number): string {
    if (time >= 60) {
      const min = Math.floor(time / 60);
      const sec = (time % 60).toFixed(2);
      return `${min}:${sec.padStart(5, '0')}`;
    }
    return `${time.toFixed(2)}s`;
  }
}
