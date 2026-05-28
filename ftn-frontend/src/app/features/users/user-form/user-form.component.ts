import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { ClubService } from '../../clubs/services/club.service';

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
  
  userData: any = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'VISITOR',
    active: true,
    birthDate: null,
    gender: '',
    niveau: '',
    discipline: '',
    anciennete: null,
    clubId: null
  };
  
  clubs: any[] = [];
  error = '';
  success = '';
  submitting = false;

  constructor(
    private userService: UserService,
    private clubService: ClubService
  ) { }

  ngOnInit(): void {
    this.loadClubs();
  }

  loadClubs() {
    this.clubService.getAll().subscribe({
      next: (data) => this.clubs = data,
      error: (err) => console.error('Erreur lors du chargement des clubs', err)
    });
  }

  resetForm() {
    this.error = '';
    this.success = '';
    this.submitting = false;
    this.userData = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'VISITOR',
      active: true,
      birthDate: null,
      gender: '',
      niveau: '',
      discipline: '',
      anciennete: null,
      clubId: null
    };
  }

  loadUser(id: number) {
    this.error = '';
    this.userService.getUserById(id).subscribe({
      next: (data) => {
        this.userData = {
          firstName: data.firstName ?? data.first_name ?? '',
          lastName: data.lastName ?? data.last_name ?? '',
          email: data.email ?? '',
          password: '',
          role: data.role ?? 'VISITOR',
          active: data.active ?? false,
          birthDate: data.birthDate || null,
          gender: data.gender || '',
          niveau: data.niveau || '',
          discipline: data.discipline || '',
          anciennete: data.anciennete || null,
          clubId: data.clubId || null
        };
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement de l\'utilisateur';
        console.error(err);
      }
    });
  }

  saveUser() {
    if (this.isViewOnly) return;

    this.error = '';
    this.success = '';

    if (!this.userData.firstName?.trim() || 
        !this.userData.lastName?.trim() || 
        !this.userData.email?.trim() || 
        !this.userData.role || 
        !this.userData.birthDate || 
        !this.userData.gender || 
        !this.userData.niveau || 
        !this.userData.discipline || 
        this.userData.anciennete === null) {
      this.error = 'Tous les champs sont obligatoires.';
      return;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(this.userData.email)) {
      this.error = 'Le format de l\'email est incorrect.';
      return;
    }

    if (!this.isEditMode && !this.userData.password?.trim()) {
      this.error = 'Le mot de passe est obligatoire.';
      return;
    }

    this.submitting = true;

    if (this.isEditMode && this._userId) {
      const updateData = {
        firstName: this.userData.firstName.trim(),
        lastName: this.userData.lastName.trim(),
        email: this.userData.email.trim(),
        role: this.userData.role,
        active: this.userData.active === true || this.userData.active === 'true',
        birthDate: this.userData.birthDate || null,
        gender: this.userData.gender || null,
        niveau: this.userData.niveau || null,
        discipline: this.userData.discipline || null,
        anciennete: this.userData.anciennete || null,
        clubId: this.userData.clubId || null
      };

      this.userService.updateUser(this._userId, updateData).subscribe({
        next: () => {
          this.success = 'Utilisateur mis à jour avec succès.';
          this.submitting = false;
          setTimeout(() => this.formSaved.emit(), 1000);
        },
        error: (err) => {
          this.submitting = false;
          this.error = 'Erreur lors de la mise à jour: ' + (err?.error?.message || 'Une erreur est survenue');
          console.error(err);
        }
      });
    } else {
      const createData = {
        firstName: this.userData.firstName.trim(),
        lastName: this.userData.lastName.trim(),
        email: this.userData.email.trim(),
        password: this.userData.password,
        role: this.userData.role,
        birthDate: this.userData.birthDate || null,
        gender: this.userData.gender || null,
        niveau: this.userData.niveau || null,
        discipline: this.userData.discipline || null,
        anciennete: this.userData.anciennete || null,
        clubId: this.userData.clubId || null
      };

      this.userService.createUser(createData).subscribe({
        next: () => {
          this.success = 'Utilisateur créé avec succès.';
          this.submitting = false;
          setTimeout(() => this.formSaved.emit(), 1000);
        },
        error: (err) => {
          this.submitting = false;
          this.error = 'Erreur lors de la création: ' + (err?.error?.message || 'Une erreur est survenue');
          console.error(err);
        }
      });
    }
  }

  cancel() {
    this.formClosed.emit();
  }
}
