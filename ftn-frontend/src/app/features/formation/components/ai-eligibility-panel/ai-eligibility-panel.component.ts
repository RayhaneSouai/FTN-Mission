import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  EligibilityResult,
  parseEligibilityMessage,
  ParsedEligibilityMessage
} from '../../utils/formation-eligibility.util';

@Component({
  selector: 'app-ai-eligibility-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-eligibility-panel.component.html',
  styleUrl: './ai-eligibility-panel.component.css'
})
export class AiEligibilityPanelComponent {
  @Input() result: EligibilityResult | null = null;
  @Input() isChecking = false;
  @Output() check = new EventEmitter<void>();

  get parsed(): ParsedEligibilityMessage | null {
    if (!this.result?.message) {
      return null;
    }
    return parseEligibilityMessage(this.result.message);
  }

  get resultTitle(): string {
    if (!this.result) {
      return '';
    }
    if (this.result.error) {
      return 'Analyse indisponible';
    }
    return this.result.eligible ? 'Éligible' : 'Non éligible';
  }

  onCheck(): void {
    if (!this.isChecking) {
      this.check.emit();
    }
  }
}
