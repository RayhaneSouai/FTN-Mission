import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-swimmer-health',
  templateUrl: './health.component.html'
})
export class HealthComponent implements OnInit {

  wellnessHistory: any[] = [];
  injuries: any[] = [];
  alerts: string[] = [];

  newWellness = { fatigue: 3, pain: 3, sleep: 3, stress: 3, motivation: 3, notes: '' };
  newInjury = { bodyZone: 'SHOULDER', description: '', painLevel: 5 };

  showInjuryModal = false;
  hoveredZone: string | null = null;
  selectedZone: string | null = null;

  bodyZoneLabels: Record<string, string> = {
    'HEAD': 'Tête / Visage',
    'NECK': 'Cou / Cervicales',
    'SHOULDER': 'Épaule',
    'CHEST': 'Torse / Poitrine',
    'BACK': 'Dos',
    'ELBOW': 'Coude',
    'WRIST': 'Poignet / Main',
    'HIP': 'Hanche / Bassin',
    'KNEE': 'Genou',
    'ANKLE': 'Cheville / Pied',
    'OTHER': 'Autre'
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadData();
  }

  private get userId(): number {
    try {
      const userStr = localStorage.getItem('user') || localStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.id || user.idUser || 1;
      }
    } catch (e) {}
    return 1;
  }

  loadData() {
    this.http.get<any[]>(`http://localhost:8083/ftn/api/health/wellness/${this.userId}`)
      .subscribe({ next: (data) => this.wellnessHistory = data, error: (e) => console.error(e) });
    this.http.get<any[]>(`http://localhost:8083/ftn/api/health/injury/${this.userId}`)
      .subscribe({ next: (data) => this.injuries = data, error: (e) => console.error(e) });
    this.http.get<string[]>(`http://localhost:8083/ftn/api/health/alerts/${this.userId}`)
      .subscribe({ next: (data) => this.alerts = data, error: (e) => console.error(e) });
  }

  submitWellness() {
    const payload = { ...this.newWellness, userId: this.userId };
    this.http.post('http://localhost:8083/ftn/api/health/wellness', payload).subscribe({
      next: () => {
        this.loadData();
        this.newWellness = { fatigue: 3, pain: 3, sleep: 3, stress: 3, motivation: 3, notes: '' };
      },
      error: (e) => console.error(e)
    });
  }

  declareInjury() {
    const payload = { ...this.newInjury, userId: this.userId };
    this.http.post('http://localhost:8083/ftn/api/health/injury', payload).subscribe({
      next: () => {
        this.showInjuryModal = false;
        this.selectedZone = null;
        this.loadData();
        this.newInjury = { bodyZone: 'SHOULDER', description: '', painLevel: 5 };
      },
      error: (e) => console.error(e)
    });
  }

  selectBodyPart(zoneCode: string) {
    this.selectedZone = zoneCode;
    this.newInjury.bodyZone = zoneCode;
    this.showInjuryModal = true;
  }

  getZoneLabel(code: string): string {
    return this.bodyZoneLabels[code] || code;
  }
}
