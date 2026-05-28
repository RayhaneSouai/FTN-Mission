import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-swimmer-layout',
  templateUrl: './swimmer-layout.component.html',
  styleUrls: ['./swimmer-layout.component.css']
})
export class SwimmerLayoutComponent implements OnInit {
  user: any = {};
  isSidebarCollapsed = false;

  navItems = [
    { label: 'Dashboard', icon: 'home', route: '/espace-nageur/dashboard' },
    { label: 'Mes Performances', icon: 'chart', route: '/espace-nageur/performances' },
    { label: 'Compétitions', icon: 'trophy', route: '/espace-nageur/competitions' },
    { label: 'Mon Club', icon: 'club', route: '/espace-nageur/mon-club' },
    { label: 'Actualités', icon: 'news', route: '/espace-nageur/actualites' }
  ];

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.user = user || {};
    });
  }

  logout() {
    this.authService.logout();
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}
