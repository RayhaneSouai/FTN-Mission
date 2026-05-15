import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-resultat',
  standalone: true,
  template: `
    <div class="placeholder">
      <h3>Résultats</h3>
      <p>Les résultats de la compétition seront affichés ici.</p>
    </div>
  `,
  styles: [`
    .placeholder {
      text-align: center;
      padding: 48px 24px;
      color: #6b7280;

      h3 {
        font-size: 18px;
        color: #374151;
        margin: 0 0 8px;
      }

      p {
        font-size: 14px;
        margin: 0;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultatComponent {}
