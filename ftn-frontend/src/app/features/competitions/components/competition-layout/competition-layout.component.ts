import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CompetitionChatbotComponent } from '../chatbot/chatbot.component';

@Component({
  selector: 'app-competition-layout',
  standalone: true,
  imports: [RouterOutlet, CompetitionChatbotComponent],
  template: `
    <router-outlet></router-outlet>
    <app-competition-chatbot />
  `,
})
export class CompetitionLayoutComponent {}
