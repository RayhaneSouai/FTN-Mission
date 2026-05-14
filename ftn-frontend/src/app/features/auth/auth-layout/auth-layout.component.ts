import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-auth-layout',
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.css']
})
export class AuthLayoutComponent implements OnInit, OnDestroy {
  /** Moitié gauche de l'image (login, mot de passe oublié) vs moitié droite (inscription) */
  panorama: 'left' | 'right' = 'left';

  private navSub?: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.applyPanorama(this.router.url);
    this.navSub = this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => this.applyPanorama(this.router.url));
  }

  ngOnDestroy(): void {
    this.navSub?.unsubscribe();
  }

  private applyPanorama(url: string): void {
    const path = url.split('?')[0].replace(/\/+$/, '');
    this.panorama = /(^|\/)register$/i.test(path) ? 'right' : 'left';
  }
}
