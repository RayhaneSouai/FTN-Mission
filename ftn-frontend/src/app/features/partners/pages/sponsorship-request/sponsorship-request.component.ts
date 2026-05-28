import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

type SwimmerShort = {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
};

@Component({
  selector: 'app-sponsorship-request',
  templateUrl: './sponsorship-request.component.html',
  styleUrls: ['./sponsorship-request.component.css'],
})
export class SponsorshipRequestComponent implements OnInit {

  form!: FormGroup;
  loading = false;
  message = '';
  swimmers: SwimmerShort[] = [];

  // 👉 IMPORTANT: use environment in real project later
  private readonly apiUrl = 'http://localhost:8083/ftn';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadSwimmers();
  }

  private initForm(): void {
    this.form = this.fb.group({
      swimmerId: [null, Validators.required],
      nomSponsor: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      typeSponsor: ['FINANCIER', Validators.required],
      details: ['', Validators.required],
    });
  }

  loadSwimmers(): void {
    this.http.get<SwimmerShort[]>(`${this.apiUrl}/api/users/swimmers`)
      .subscribe({
        next: (data) => {
          this.swimmers = data;
        },
        error: (err) => {
          console.error('Error loading swimmers', err);
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

    const payload = this.form.value; // ✅ IMPORTANT

    console.log('SENDING PAYLOAD:', payload); // DEBUG

    this.loading = true;

    this.http.post(
      'http://localhost:8083/ftn/api/partners/sponsorships',
      payload
    ).subscribe({
      next: () => {
        this.message = 'Demande envoyée.';
        this.loading = false;
        this.form.reset({
          typeSponsor: 'FINANCIER'
        });
      },
      error: (err) => {
        console.error(err);
        this.message = err?.error?.message || "Erreur";
        this.loading = false;
      }
    });
  }
}
