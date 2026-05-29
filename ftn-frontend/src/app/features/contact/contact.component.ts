import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1>Fédération Tunisienne de <br/> Natation</h1>
        <p>Excellence, Performance et Développement du Sport Aquatique en Tunisie</p>
      </div>
    </section>

    <!-- Section Partenaires (The first photo) -->
    <section class="partners-section" id="partenaires">
      <div class="news-header" style="margin-bottom:18px;">
        <h2>Nos Partenaires</h2>
        <button class="btn-link" type="button" (click)="openPartnerPopup()">Devenir partenaire</button>
      </div>

      <div class="premium-grid">
        <article *ngFor="let p of partners" class="premium-card">
          <div class="premium-image-wrapper">
            <div class="premium-placeholder">{{ p.initials }}</div>
            <span class="category-badge cat-sport">{{ p.category }}</span>
          </div>
          <div class="premium-content">
            <h3 class="premium-title">{{ p.name }}</h3>
            <p class="premium-excerpt">{{ p.description }}</p>
          </div>
        </article>
      </div>
    </section>

    <div class="modal-backdrop" *ngIf="partnerPopupOpen" (click)="closePartnerPopup()"></div>
    <div class="modal" *ngIf="partnerPopupOpen">
      <div class="modal-header">
        <h3>Partenariat & Sponsoring</h3>
        <button class="modal-close" (click)="closePartnerPopup()">✕</button>
      </div>
      <div class="modal-body">
        <p>Vous voulez être une partenaire de la fédération / sponsoriser un nageur ?</p>
        <div class="modal-actions">
          <button class="btn-primary" routerLink="/partenaires/demande" (click)="closePartnerPopup()">Devenir partenaire</button>
          <button class="btn-outline" routerLink="/partenaires/sponsoring" (click)="closePartnerPopup()">Sponsoriser un nageur</button>
        </div>
      </div>
    </div>

    <!-- Contact Info -->
    <section class="contact-section" style="padding: 60px 20px 100px; text-align: center; background: #f8fafc;">
      <h2 style="color: #0f172a; margin-bottom: 20px; font-size: 32px; font-weight: 800;">Contactez-nous</h2>
      <p style="color: #64748b; font-size: 18px; margin-bottom: 40px;">Une question ? Nous sommes à votre écoute.</p>
      
      <div style="display: flex; justify-content: center; gap: 40px; flex-wrap: wrap;">
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.1); width: 300px; border: 1px solid #e2e8f0;">
          <div style="font-size: 30px; margin-bottom: 15px;">✉️</div>
          <h3 style="color: #0f172a; margin-bottom: 10px; font-size: 20px; font-weight: 700;">Email</h3>
          <p style="color: #1565C0; font-weight: 600;">contact&#64;ftn.tn</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.1); width: 300px; border: 1px solid #e2e8f0;">
          <div style="font-size: 30px; margin-bottom: 15px;">📞</div>
          <h3 style="color: #0f172a; margin-bottom: 10px; font-size: 20px; font-weight: 700;">Téléphone</h3>
          <p style="color: #1565C0; font-weight: 600;">+216 71 XXX XXX</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.1); width: 300px; border: 1px solid #e2e8f0;">
          <div style="font-size: 30px; margin-bottom: 15px;">📍</div>
          <h3 style="color: #0f172a; margin-bottom: 10px; font-size: 20px; font-weight: 700;">Adresse</h3>
          <p style="color: #475569;">Avenue de la Ligue Arabe<br/>1002 Tunis, Tunisie</p>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['../home/home.component.css']
})
export class ContactComponent {
  partnerPopupOpen = false;

  partners = [
    { name: 'Fédération & Natation Tunisie', category: 'Natation', initials: 'FN', description: 'Partenaire de développement de la natation en Tunisie.' },
    { name: 'Sport Aquatique Club', category: 'Sport', initials: 'SA', description: 'Soutien aux compétitions et à la formation.' },
    { name: 'Sponsoring Hydra', category: 'Natation', initials: 'HY', description: 'Sponsoring d’athlètes et d’événements aquatiques.' },
    { name: 'Club Méditerranée', category: 'Sport', initials: 'CM', description: 'Partenaire stratégique pour la promotion du sport.' },
    { name: 'Media Wave', category: 'Natation', initials: 'MW', description: 'Partenaire médiatique pour la visibilité des nageurs.' },
  ];

  openPartnerPopup(): void {
    this.partnerPopupOpen = true;
  }

  closePartnerPopup(): void {
    this.partnerPopupOpen = false;
  }
}
