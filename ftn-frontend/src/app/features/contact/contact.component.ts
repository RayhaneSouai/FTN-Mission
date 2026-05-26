import { Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  standalone: true,
  template: `
    <section class="contact-section" style="padding: 100px 20px; text-align: center;">
      <h2 style="color: #004da3; margin-bottom: 20px; font-size: 32px; font-weight: bold;">Contactez-nous</h2>
      <p style="color: #64748b; font-size: 18px; margin-bottom: 40px;">Une question ? Nous sommes à votre écoute.</p>
      
      <div style="display: flex; justify-content: center; gap: 40px; flex-wrap: wrap;">
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); width: 300px;">
          <h3 style="color: #0f172a; margin-bottom: 10px; font-size: 20px;">Email</h3>
          <p style="color: #475569;">contact&#64;ftn.tn</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); width: 300px;">
          <h3 style="color: #0f172a; margin-bottom: 10px; font-size: 20px;">Téléphone</h3>
          <p style="color: #475569;">+216 71 XXX XXX</p>
        </div>
        <div style="background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); width: 300px;">
          <h3 style="color: #0f172a; margin-bottom: 10px; font-size: 20px;">Adresse</h3>
          <p style="color: #475569;">Avenue de la Ligue Arabe<br/>1002 Tunis, Tunisie</p>
        </div>
      </div>
    </section>
  `
})
export class ContactComponent {
}
