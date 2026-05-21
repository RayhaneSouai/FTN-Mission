import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { UserService } from '../../users/services/user.service';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css']
})
export class ProfilePageComponent implements OnInit {
  user: any = null;
  loading = true;
  error = '';
  success = '';

  constructor(
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadProfile();
    }
  }

  loadProfile() {
    if (isPlatformBrowser(this.platformId)) {
      this.loading = true;
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const storedUser = JSON.parse(userStr);
        this.userService.getUserById(storedUser.id).subscribe({
          next: (data) => {
            this.user = data;
            this.loading = false;
          },
          error: (err) => {
            this.error = 'Erreur lors du chargement du profil';
            this.loading = false;
            console.error(err);
          }
        });
      } else {
        this.error = 'Utilisateur non connecté';
        this.loading = false;
      }
    }
  }

  saveProfile() {
    if (isPlatformBrowser(this.platformId)) {
      this.loading = true;
      this.userService.updateUser(this.user.id, this.user).subscribe({
        next: (data) => {
          this.user = data;
          localStorage.setItem('user', JSON.stringify(data));
          this.success = 'Profil mis à jour avec succès';
          this.loading = false;
          setTimeout(() => this.success = '', 3000);
        },
        error: (err) => {
          this.error = 'Erreur lors de la mise à jour du profil';
          this.loading = false;
          console.error(err);
        }
      });
    }
  }
}
