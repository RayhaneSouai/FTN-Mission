import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  user: any = null;
  isLoggedIn = false;
  isAdmin = false;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.checkLogin();
    }
  }

  checkLogin() {
    if (isPlatformBrowser(this.platformId)) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        this.user = JSON.parse(userStr);
        this.isLoggedIn = true;
        this.isAdmin = localStorage.getItem('isAdmin') === 'true';
      } else {
        this.user = null;
        this.isLoggedIn = false;
        this.isAdmin = false;
      }
    }
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
      this.isLoggedIn = false;
      this.user = null;
      this.router.navigate(['/auth/login']);
    }
  }
}
