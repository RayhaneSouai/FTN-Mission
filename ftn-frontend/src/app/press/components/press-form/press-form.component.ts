import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PressItem, PressType } from '../../models/press-item.model';
import { PressService } from '../../services/press.service';

@Component({
  selector: 'app-press-form',
  templateUrl: './press-form.component.html',
  styleUrls: ['./press-form.component.css']
})
export class PressFormComponent implements OnInit {
  isEdit = false;
  loading = false;
  submitting = false;
  message = '';
  messageType: 'success' | 'error' = 'success';

  types: PressType[] = ['ARTICLE', 'VIDEO', 'PHOTO', 'COMMUNIQUE'];
  disciplines: string[] = ['Natation', 'Water-Polo', 'Plongeon', 'Natation Artistique', 'Eau Libre', 'Général'];

  item: PressItem = {
    title: '',
    content: '',
    mediaUrl: '',
    discipline: '',
    type: 'ARTICLE'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public pressService: PressService,
    private http: HttpClient
  ) {}

  fetchFromUrl(): void {
    if (!this.item.linkUrl) {
      this.showMessage('Veuillez entrer un lien valide.', 'error');
      return;
    }

    this.loading = true;
    this.http.get<any>(`/api/press/fetch-metadata?url=${encodeURIComponent(this.item.linkUrl)}`).subscribe({
      next: (data) => {
        if (data.error) {
          this.showMessage(data.error, 'error');
        } else {
          this.item.title = data.title || '';
          
          // Extraction des 3 premières phrases de la description reçue
          const rawContent = data.content || '';
          const sentences = rawContent.split(/[.!?]\s+/);
          this.item.content = sentences.slice(0, 3).join('. ') + (sentences.length > 0 ? '.' : '');
          
          if (data.image) this.item.mediaUrl = data.image;
          this.showMessage('Données extraites avec succès !', 'success');
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.showMessage('Erreur lors de la communication avec l\'extracteur.', 'error');
      }
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.loading = true;
      this.pressService.getById(+id).subscribe({
        next: (data) => { this.item = data; this.loading = false; },
        error: () => { this.showMessage('Impossible de charger l\'article.', 'error'); this.loading = false; }
      });
    }
  }

  submit(): void {
    if (!this.item.title || !this.item.content || !this.item.discipline) {
      this.showMessage('Veuillez remplir tous les champs obligatoires.', 'error');
      return;
    }
    this.submitting = true;
    const action$ = this.isEdit 
      ? this.pressService.update(this.item.idPressItem!, this.item)
      : this.pressService.add(this.item);

    action$.subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/press']);
      },
      error: () => {
        this.submitting = false;
        this.showMessage('Erreur lors de l\'enregistrement.', 'error');
      }
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      
      this.loading = true;
      this.http.post<any>('/api/press/upload', formData).subscribe({
        next: (res) => {
          this.item.mediaUrl = res.url;
          this.loading = false;
          this.showMessage('Image téléchargée avec succès !', 'success');
        },
        error: () => {
          this.loading = false;
          this.showMessage('Erreur lors du téléchargement de l\'image.', 'error');
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/press']);
  }

  showMessage(msg: string, type: 'success' | 'error'): void {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => this.message = '', 3500);
  }
}
