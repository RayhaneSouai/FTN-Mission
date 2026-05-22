import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

type SwimmerShort = { id: number; firstName: string; lastName: string; email?: string };

@Component({
  selector: 'app-sponsorship-request',
  templateUrl: './sponsorship-request.component.html',
  styleUrls: ['./sponsorship-request.component.scss'],
})
export class SponsorshipRequestComponent implements OnInit {
  loading = false;
  message = '';
  swimmers: SwimmerShort[] = [];

  form = this.fb.group({
    swimmerId: [null, Validators.required],
    typeSponsor: ['FINANCIER', Validators.required],
    details: ['', Validators.required],
  });

  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit(): void {
    // MVP: utiliser la liste publique des nageurs
    this.http.get<SwimmerShort[]>('http://localhost:8083/ftn/api/users/swimmers')
      .subscribe({
        next: (data) => {
          this.swimmers = data || [];
        },
        error: () => {
          this.swimmers = [];
        }
      });
  }

  submit(): void {
    this.message = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.http.post('http://localhost:8083/ftn/api/partners/sponsorships', this.form.value)
      .subscribe({
        next: () => {
          this.message = 'Demande de sponsoring envoyée. En attente de validation.';
          this.loading = false;
          this.form.reset({ typeSponsor: 'FINANCIER', details: '' });
        },
        error: (err) => {
          this.message = err?.error?.message || "Erreur lors de l'envoi.";
          this.loading = false;
        }
      });
  }
}

