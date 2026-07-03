import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { Club, ClubJoinPreview, ClubJoinRequest } from '../../models/club.model';
import { ClubService } from '../../services/club.service';
import { ToastService } from '../../../competitions/services/toast.service';

const LEVEL_OPTIONS = ['BENJAMIN', 'MINIME', 'CADET', 'JUNIOR', 'SENIOR'] as const;
const AVAILABILITY_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] as const;

@Component({
  selector: 'app-club-join-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './club-join-form.component.html',
  styleUrl: './club-join-form.component.css'
})
export class ClubJoinFormComponent implements OnInit, OnDestroy {
  @Input({ required: true }) club!: Club;
  @Output() closed = new EventEmitter<void>();
  @Output() completed = new EventEmitter<ClubJoinRequest>();

  readonly levelOptions = LEVEL_OPTIONS;
  readonly availabilityDays = AVAILABILITY_DAYS;

  form!: FormGroup;
  submitting = false;
  loadingPreview = false;
  preview: ClubJoinPreview | null = null;
  result: ClubJoinRequest | null = null;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private clubService: ClubService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      motivationLetter: ['', [Validators.required, Validators.minLength(10)]],
      currentLevel: ['', Validators.required],
      previousClub: [''],
      availability: this.fb.group(
        Object.fromEntries(this.availabilityDays.map((day) => [day, [false]]))
      )
    });

    this.loadPreview();
    this.form.get('currentLevel')?.valueChanges.pipe(
      debounceTime(250),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe((level) => this.loadPreview(level || undefined));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPreview(currentLevel?: string): void {
    if (!this.club?.id) return;
    this.loadingPreview = true;
    this.clubService.previewJoin(this.club.id, currentLevel).subscribe({
      next: (preview) => {
        this.preview = preview;
        this.loadingPreview = false;
      },
      error: () => {
        this.loadingPreview = false;
      }
    });
  }

  field(name: string) {
    return this.form.get(name);
  }

  isInvalid(name: string): boolean {
    const control = this.field(name);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  get resultClass(): string {
    if (!this.result) return '';
    if (this.result.status === 'APPROVED') return 'result-approved';
    if (this.result.status === 'REJECTED') return 'result-rejected';
    return 'result-pending';
  }

  get previewClass(): string {
    if (!this.preview) return '';
    if (this.preview.predictedStatus === 'APPROVED') return 'preview-approved';
    if (this.preview.predictedStatus === 'REJECTED') return 'preview-rejected';
    return 'preview-pending';
  }

  get resultMessage(): string {
    if (!this.result) return '';
    switch (this.result.status) {
      case 'APPROVED':
        return 'Votre demande a été approuvée automatiquement ! Bienvenue dans le club.';
      case 'PENDING':
        return 'Votre demande est en cours d\'examen par le club (liste d\'attente).';
      case 'REJECTED':
        return `Votre demande a été refusée. Raison : ${this.result.rejectionReason ?? 'non précisée.'}`;
      default:
        return '';
    }
  }

  submit(): void {
    if (this.form.invalid || !this.club?.id) {
      this.form.markAllAsTouched();
      return;
    }

    const dayMap: Record<string, string> = {
      Lun: 'Lundi', Mar: 'Mardi', Mer: 'Mercredi', Jeu: 'Jeudi',
      Ven: 'Vendredi', Sam: 'Samedi', Dim: 'Dimanche'
    };
    const selectedDays = Object.entries(this.form.value.availability as Record<string, boolean>)
      .filter(([, checked]) => checked)
      .map(([day]) => dayMap[day] || day);

    this.submitting = true;
    this.clubService
      .joinClub(this.club.id, {
        motivationLetter: this.form.value.motivationLetter.trim(),
        currentLevel: this.form.value.currentLevel,
        previousClub: this.form.value.previousClub?.trim() || undefined,
        availability: selectedDays.join(', ') || undefined
      })
      .subscribe({
        next: (result) => {
          this.submitting = false;
          this.result = result;
          this.completed.emit(result);
        },
        error: (err) => {
          this.submitting = false;
          if (err?.status === 401 || err?.status === 403) {
            this.toast.showError('Session expirée. Veuillez vous reconnecter.');
            this.router.navigate(['/auth/login'], { queryParams: { returnUrl: '/clubs' } });
            return;
          }
          const message = err?.error?.message?.replace(/^Erreur:\s*/, '') || 'Impossible d\'envoyer la demande.';
          this.toast.showError(message);
        }
      });
  }

  close(): void {
    this.closed.emit();
  }
}
