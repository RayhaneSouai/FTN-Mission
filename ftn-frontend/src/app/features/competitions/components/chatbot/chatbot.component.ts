import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface FaqItem {
  question: string;
  answer: string;
  keywords: string[];
}

interface ChatMessage {
  text: string;
  isUser: boolean;
}

@Component({
  selector: 'app-competition-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.scss'],
})
export class CompetitionChatbotComponent {
  isOpen = signal(false);
  userInput = '';
  messages = signal<ChatMessage[]>([
    { text: 'Bonjour ! Je suis l\'assistant compétitions de la FTN. Posez-moi une question ou choisissez un sujet ci-dessous.', isUser: false }
  ]);
  showSuggestions = signal(true);

  private readonly faq: FaqItem[] = [
    {
      question: 'Comment participer à une compétition ?',
      answer: 'Pour participer, rendez-vous sur la page de la compétition souhaitée et cliquez sur "Demander à participer". Votre demande sera examinée par l\'admin.',
      keywords: ['participer', 'inscription', 'inscrire', 'demande', 'participation']
    },
    {
      question: 'Quelles sont les catégories d\'âge ?',
      answer: 'Les catégories sont : Avenirs (≤9 ans), Poussins (10-11 ans), Benjamins (12-13 ans), Minimes (14-15 ans), Cadets (16-17 ans), Juniors/Seniors (18+ ans).',
      keywords: ['catégorie', 'categorie', 'âge', 'age', 'avenirs', 'poussins', 'benjamins', 'minimes', 'cadets', 'juniors', 'seniors']
    },
    {
      question: 'Ai-je besoin d\'une licence ?',
      answer: 'Certaines compétitions exigent une licence validée. Vérifiez les conditions de participation sur la page de la compétition. Si requis, votre licence doit être validée et non expirée.',
      keywords: ['licence', 'license', 'obligatoire', 'requis', 'validée']
    },
    {
      question: 'Comment voir le programme ?',
      answer: 'Dans la page de détails d\'une compétition, cliquez sur l\'onglet "Programme" pour voir les journées, séries et horaires prévus.',
      keywords: ['programme', 'horaire', 'série', 'serie', 'planning', 'journée']
    },
    {
      question: 'Comment consulter les résultats ?',
      answer: 'Les résultats sont disponibles dans l\'onglet "Résultats" de chaque compétition une fois celle-ci terminée.',
      keywords: ['résultat', 'resultat', 'classement', 'temps', 'performance']
    },
    {
      question: 'Quelles sont les conditions de participation ?',
      answer: 'Les conditions varient par compétition : catégorie d\'âge, genre, licence obligatoire, certificat médical, et éventuellement des minimas de temps. Consultez la section "Conditions" sur la page de la compétition.',
      keywords: ['condition', 'conditions', 'minimas', 'certificat', 'médical', 'genre']
    },
    {
      question: 'Qu\'est-ce que la répartition ?',
      answer: 'La répartition distribue automatiquement les nageurs approuvés dans les séries du programme selon leur catégorie, genre et meilleur temps.',
      keywords: ['répartition', 'repartition', 'distribution', 'série', 'nageur']
    },
    {
      question: 'Comment contacter la fédération ?',
      answer: 'Vous pouvez nous contacter via la page "Contact" accessible depuis le menu principal, ou par email à contact@ftn.tn.',
      keywords: ['contact', 'email', 'fédération', 'joindre', 'téléphone']
    },
  ];

  readonly suggestions = this.faq.slice(0, 4).map(f => f.question);

  toggle(): void {
    this.isOpen.update(v => !v);
  }

  selectSuggestion(question: string): void {
    this.showSuggestions.set(false);
    this.addMessage(question, true);
    const faqItem = this.faq.find(f => f.question === question);
    if (faqItem) {
      setTimeout(() => this.addMessage(faqItem.answer, false), 400);
    }
  }

  send(): void {
    const input = this.userInput.trim();
    if (!input) return;
    this.showSuggestions.set(false);
    this.addMessage(input, true);
    this.userInput = '';

    const answer = this.findAnswer(input);
    setTimeout(() => this.addMessage(answer, false), 500);
  }

  private findAnswer(input: string): string {
    const lower = input.toLowerCase();
    let bestMatch: FaqItem | null = null;
    let bestScore = 0;

    for (const item of this.faq) {
      const score = item.keywords.filter(kw => lower.includes(kw)).length;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = item;
      }
    }

    if (bestMatch && bestScore > 0) {
      return bestMatch.answer;
    }
    return 'Désolé, je n\'ai pas trouvé de réponse à votre question. Essayez de reformuler ou consultez les suggestions.';
  }

  private addMessage(text: string, isUser: boolean): void {
    this.messages.update(msgs => [...msgs, { text, isUser }]);
  }
}
