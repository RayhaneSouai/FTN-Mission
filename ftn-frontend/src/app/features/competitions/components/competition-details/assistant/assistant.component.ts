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
  selector: 'app-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assistant.component.html',
  styleUrls: ['./assistant.component.scss'],
})
export class AssistantComponent {
  userInput = '';
  messages = signal<ChatMessage[]>([
    { text: 'Bonjour ! Je suis l\'assistant compétitions de la FTN. Posez-moi une question ou choisissez un sujet ci-dessous.', isUser: false }
  ]);
  showSuggestions = signal(true);

  private readonly faq: FaqItem[] = [
    {
      question: 'Comment participer à une compétition ?',
      answer: 'Pour participer, rendez-vous sur la page de la compétition souhaitée et cliquez sur "Demander à participer". Votre demande sera examinée par l\'admin qui l\'approuvera ou la refusera.',
      keywords: ['participer', 'inscription', 'inscrire', 'demande', 'participation']
    },
    {
      question: 'Quelles sont les catégories d\'âge ?',
      answer: 'Les catégories sont :\n• Avenirs (≤9 ans)\n• Poussins (10-11 ans)\n• Benjamins (12-13 ans)\n• Minimes (14-15 ans)\n• Cadets (16-17 ans)\n• Juniors/Seniors (18+ ans)',
      keywords: ['catégorie', 'categorie', 'âge', 'age', 'avenirs', 'poussins', 'benjamins', 'minimes', 'cadets', 'juniors', 'seniors']
    },
    {
      question: 'Ai-je besoin d\'une licence ?',
      answer: 'Certaines compétitions exigent une licence validée. Vérifiez les "Conditions de participation" sur la page de la compétition. Si une licence est requise, elle doit être validée et non expirée.',
      keywords: ['licence', 'license', 'obligatoire', 'requis', 'validée']
    },
    {
      question: 'Comment voir le programme de la compétition ?',
      answer: 'Le programme est disponible une fois approuvé par l\'admin. Il détaille les journées, les séries (épreuves), les horaires et les catégories concernées.',
      keywords: ['programme', 'horaire', 'série', 'serie', 'planning', 'journée', 'épreuve']
    },
    {
      question: 'Comment consulter les résultats ?',
      answer: 'Les résultats sont disponibles dans l\'onglet "Résultat" de cette compétition une fois les épreuves terminées. Vous y trouverez les temps officiels et le classement.',
      keywords: ['résultat', 'resultat', 'classement', 'temps', 'performance', 'officiel']
    },
    {
      question: 'Quelles sont les conditions de participation ?',
      answer: 'Les conditions varient par compétition :\n• Catégorie d\'âge autorisée\n• Genre (Homme/Femme/Tous)\n• Licence obligatoire ou non\n• Certificat médical\n• Minimas de temps éventuels\n\nConsultez la section "Conditions de participation" dans la vue d\'ensemble.',
      keywords: ['condition', 'conditions', 'minimas', 'certificat', 'médical', 'genre', 'prérequis']
    },
    {
      question: 'Qu\'est-ce que la répartition des nageurs ?',
      answer: 'La répartition distribue automatiquement les nageurs approuvés dans les séries du programme. Elle se base sur la catégorie d\'âge, le genre et le meilleur temps de chaque nageur.',
      keywords: ['répartition', 'repartition', 'distribution', 'série', 'nageur', 'affectation']
    },
    {
      question: 'Ma participation a été refusée, pourquoi ?',
      answer: 'Votre participation peut être refusée si :\n• Vous ne correspondez pas à la catégorie d\'âge\n• Votre licence n\'est pas validée (si requise)\n• Le genre ne correspond pas\n• Vous n\'atteignez pas les minimas requis\n• La date limite d\'inscription est dépassée',
      keywords: ['refusé', 'refusée', 'rejet', 'refus', 'pourquoi', 'raison']
    },
    {
      question: 'Comment contacter la fédération ?',
      answer: 'Vous pouvez contacter la Fédération Tunisienne de Natation via la page "Contact" dans le menu principal, ou par email à contact@ftn.tn.',
      keywords: ['contact', 'email', 'fédération', 'joindre', 'téléphone', 'aide']
    },
  ];

  readonly suggestions = this.faq.map(f => f.question);

  selectSuggestion(question: string): void {
    this.showSuggestions.set(false);
    this.addMessage(question, true);
    const faqItem = this.faq.find(f => f.question === question);
    if (faqItem) {
      setTimeout(() => {
        this.addMessage(faqItem.answer, false);
        this.showSuggestions.set(true);
      }, 400);
    }
  }

  send(): void {
    const input = this.userInput.trim();
    if (!input) return;
    this.showSuggestions.set(false);
    this.addMessage(input, true);
    this.userInput = '';

    const answer = this.findAnswer(input);
    setTimeout(() => {
      this.addMessage(answer, false);
      this.showSuggestions.set(true);
    }, 500);
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
    return 'Désolé, je n\'ai pas trouvé de réponse à votre question. Essayez de reformuler ou choisissez parmi les suggestions proposées.';
  }

  private addMessage(text: string, isUser: boolean): void {
    this.messages.update(msgs => [...msgs, { text, isUser }]);
  }
}
