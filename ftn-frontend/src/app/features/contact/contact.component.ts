import { Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  standalone: true,
  template: `
    <section class="hero">
      <div class="hero-bg"></div>
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1>Fédération Tunisienne de <br/> Natation</h1>
        <p>Excellence, Performance et Développement du Sport Aquatique en Tunisie</p>
      </div>
    </section>

    <section class="contact-section" style="padding: 100px 20px; text-align: center; background: #f8fafc;">
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
  styles: [`
    .hero {
      position: relative;
      height: 400px;
      display: flex;
      align-items: center;
      padding: 0 80px;
      color: #fff;
      overflow: hidden;
    }
    .hero-bg {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image: url('/assets/home-hero.png');
      background-size: cover;
      background-position: center;
      z-index: -1;
    }
    .hero-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(90deg, rgba(11, 44, 91, 0.85) 0%, rgba(18, 66, 131, 0.6) 40%, rgba(21, 101, 192, 0.3) 100%);
      z-index: 0;
    }
    .hero-content {
      position: relative;
      z-index: 1;
      max-width: 650px;
      animation: fadeInUp 0.8s ease-out;
    }
    .hero-content h1 {
      font-size: 48px;
      font-weight: 700;
      line-height: 1.1;
      margin: 0 0 20px;
      letter-spacing: -1px;
    }
    .hero-content p {
      font-size: 18px;
      opacity: 0.9;
      margin-bottom: 40px;
      line-height: 1.6;
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (max-width: 992px) {
      .hero { padding: 0 40px; height: 350px; }
      .hero-content h1 { font-size: 36px; }
    }
    @media (max-width: 600px) {
      .hero { padding: 0 24px; height: 300px; }
    }
  `]
})
export class ContactComponent {
}
