import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UserService } from '../services/user.service';
import { AdminUserCreateRequest } from '../models/admin-user-create.model';
import { ClubService } from '../../clubs/services/club.service';

type UserRole = 'ADMIN' | 'COACH' | 'SWIMMER' | 'VISITOR';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent implements OnInit {
  @Input() set userId(id: number | null) {
    this._userId = id;
    if (id) {
      this.isEditMode = true;
      this.loadUser(id);
    } else {
      this.isEditMode = false;
      this.resetForm();
    }
  }

  @Input() isViewOnly: boolean = false;

  @Output() formSaved = new EventEmitter<void>();
  @Output() formClosed = new EventEmitter<void>();

  private _userId: number | null = null;
  isEditMode = false;

  userData: {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    role: UserRole;
    active: boolean;
    birthDate: string | null;
    gender: string;
    niveau: string;
    discipline: string;
    anciennete: number | null;
    clubId: number | null;
  } = this.emptyUserData();

  clubs: any[] = [];
  error = '';
  success = '';
  submitting = false;

  constructor(private userService: UserService, private clubService: ClubService) {}

  ngOnInit(): void {
    this.loadClubs();
  }

  loadClubs() {
    this.clubService.getAll().subscribe({
      next: (data) => this.clubs = data,
      error: (err) => console.error('Erreur lors du chargement des clubs', err)
    });
  }

  get isSwimmer(): boolean {
    return this.userData.role === 'SWIMMER';
  }

  get isCoach(): boolean {
    return this.userData.role === 'COACH';
  }

  get showSportSection(): boolean {
    return this.isSwimmer || this.isCoach;
  }

  onRoleChange(role: UserRole): void {
    this.userData.role = role;
    if (role === 'COACH') {
      this.userData.discipline = '';
      this.userData.niveau = '';
    } else if (role === 'SWIMMER') {
      this.userData.anciennete = null;
    } else {
      this.userData.discipline = '';
      this.userData.niveau = '';
      this.userData.anciennete = null;
    }
  }

  resetForm(): void {
    this.error = '';
    this.success = '';
    this.submitting = false;
    this.userData = this.emptyUserData();
  }

  private emptyUserData() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'SWIMMER' as UserRole,
      active: true,
      birthDate: null as string | null,
      gender: '',
      niveau: '',
      discipline: '',
      anciennete: null as number | null,
      clubId: null as number | null
    };
  }

  loadUser(id: number): void {
    this.error = '';
    this.userService.getUserById(id).subscribe({
      next: (data) => {
        this.userData = {
          firstName: data.firstName ?? data.first_name ?? '',
          lastName: data.lastName ?? data.last_name ?? '',
          email: data.email ?? '',
          role: (data.role ?? 'VISITOR') as UserRole,
          active: data.active ?? false,
          birthDate: data.birthDate || null,
          gender: data.gender || '',
          niveau: data.niveau || '',
          discipline: data.discipline || '',
          anciennete: data.anciennete ?? null,
          clubId: data.clubId ?? null
        };
        this.onRoleChange(this.userData.role);
      },
      error: (err) => {
        this.error = "Erreur lors du chargement de l'utilisateur";
        console.error(err);
      }
    });
  }

  saveUser(): void {
    if (this.isViewOnly) return;

    this.error = '';
    this.success = '';

    const validationError = this.validateForm();
    if (validationError) {
      this.error = validationError;
      return;
    }

    this.submitting = true;
    if (this.isEditMode && this._userId) {
      this.userService.updateUser(this._userId, this.buildUpdatePayload()).subscribe({
        next: () => {
          this.success = 'Utilisateur mis à jour avec succès.';
          this.submitting = false;
          setTimeout(() => this.formSaved.emit(), 1000);
        },
        error: (err) => {
          this.submitting = false;
          this.error = this.extractErrorMessage(err, 'Erreur lors de la mise à jour.');
          console.error(err);
        }
      });
    } else {
      this.userService.createUser(this.buildCreatePayload()).subscribe({
        next: () => {
          this.success = 'Utilisateur créé avec succès.';
          this.submitting = false;
          setTimeout(() => this.formSaved.emit(), 1200);
        },
        error: (err) => {
          this.submitting = false;
          this.error = this.extractErrorMessage(err, 'Erreur lors de la création.');
          console.error(err);
        }
      });
    }
  }

  private validateForm(): string | null {
    if (!this.userData.firstName?.trim() || !this.userData.lastName?.trim() || !this.userData.email?.trim()) {
      return "Le prénom, le nom et l'email sont obligatoires.";
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(this.userData.email)) {
      return "Le format de l'email est incorrect.";
    }

    if (!this.userData.role) {
      return "Le rôle est obligatoire.";
    }

    if (this.userData.role === 'SWIMMER') {
      if (!this.userData.gender || !this.userData.birthDate || !this.userData.discipline || !this.userData.niveau) {
        return "Pour un nageur : genre, date de naissance, discipline et niveau sont obligatoires.";
      }
    } else if (this.userData.role === 'COACH') {
      if (!this.userData.gender || !this.userData.birthDate) {
        return "Pour un coach : genre et date de naissance sont obligatoires.";
      }
      if (this.userData.anciennete === null || this.userData.anciennete === undefined || this.userData.anciennete < 0) {
        return "L'ancienneté est obligatoire pour un coach.";
      }
      if (!this.userData.clubId) {
        return "L'affectation à un club est obligatoire pour un coach.";
      }
    }
    return null;
  }

  private buildCreatePayload(): AdminUserCreateRequest {
    const sport = this.sportFieldsForRole();
    return {
      firstName: this.userData.firstName.trim(),
      lastName: this.userData.lastName.trim(),
      email: this.userData.email.trim(),
      role: this.userData.role,
      birthDate: this.userData.birthDate || null,
      gender: this.userData.gender || null,
      ...sport,
      clubId: this.userData.clubId || null
    };
  }

  private buildUpdatePayload(): Record<string, unknown> {
    const sport = this.sportFieldsForRole();
    return {
      firstName: this.userData.firstName.trim(),
      lastName: this.userData.lastName.trim(),
      email: this.userData.email.trim(),
      role: this.userData.role,
      active: this.userData.active,
      birthDate: this.userData.birthDate || null,
      gender: this.userData.gender || null,
      ...sport,
      clubId: this.userData.clubId || null
    };
  }

  private sportFieldsForRole(): { discipline: string | null; niveau: string | null; anciennete: number | null } {
    if (this.userData.role === 'SWIMMER') {
      return { discipline: this.userData.discipline || null, niveau: this.userData.niveau || null, anciennete: null };
    }
    if (this.userData.role === 'COACH') {
      return { discipline: null, niveau: null, anciennete: this.userData.anciennete };
    }
    return { discipline: null, niveau: null, anciennete: null };
  }

  private extractErrorMessage(err: any, fallback: string): string {
    const msg = err?.error?.message ?? err?.error?.details ?? err?.message;
    if (typeof msg === 'string' && msg.length > 0) {
      return msg.startsWith('Erreur:') ? msg.replace(/^Erreur:\s*/, '') : msg;
    }
    return fallback;
  }

  cancel(): void {
    this.formClosed.emit();
  }
}
