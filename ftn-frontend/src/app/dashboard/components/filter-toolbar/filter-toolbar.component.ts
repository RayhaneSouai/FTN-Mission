import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  CHART_RANGE_PRESETS,
  ChartDateRange,
  ChartRangePreset,
  resolveChartDateRange
} from '../../models/chart-range.model';

@Component({
  selector: 'app-filter-toolbar',
  templateUrl: './filter-toolbar.component.html',
  styleUrls: ['./filter-toolbar.component.css']
})
export class FilterToolbarComponent implements OnInit {
  @Output() rangeChange = new EventEmitter<ChartDateRange>();

  readonly presets = CHART_RANGE_PRESETS;
  selectedPreset: ChartRangePreset = '7d';
  customForm!: FormGroup;
  customError = '';

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    const today = this.toInputDate(new Date());
    const monthAgo = this.toInputDate(this.addDays(new Date(), -29));
    this.customForm = this.fb.group({
      start: [monthAgo, Validators.required],
      end: [today, Validators.required]
    });
    this.emitPreset('7d');
  }

  onPresetClick(preset: ChartRangePreset): void {
    this.selectedPreset = preset;
    this.customError = '';
    if (preset !== 'custom') {
      this.emitPreset(preset);
    }
  }

  applyCustomRange(): void {
    if (this.customForm.invalid) {
      this.customError = 'Veuillez sélectionner une date de début et de fin.';
      return;
    }

    const start = this.fromInputDate(this.customForm.value.start);
    const end = this.fromInputDate(this.customForm.value.end);
    if (!start || !end) {
      this.customError = 'Dates invalides.';
      return;
    }
    if (start > end) {
      this.customError = 'La date de début doit être antérieure à la date de fin.';
      return;
    }

    this.customError = '';
    this.rangeChange.emit(resolveChartDateRange('custom', start, end));
  }

  isActive(preset: ChartRangePreset): boolean {
    return this.selectedPreset === preset;
  }

  private emitPreset(preset: ChartRangePreset): void {
    this.rangeChange.emit(resolveChartDateRange(preset));
  }

  private toInputDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private fromInputDate(value: string): Date | null {
    if (!value) {
      return null;
    }
    const [year, month, day] = value.split('-').map(Number);
    const parsed = new Date(year, month - 1, day);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}
