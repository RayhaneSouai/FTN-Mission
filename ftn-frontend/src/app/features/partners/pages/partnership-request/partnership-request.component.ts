import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-partnership-request',
  templateUrl: './partnership-request.component.html',
  styleUrls: ['./partnership-request.component.css']
})
export class PartnershipRequestComponent implements OnInit {

  form!: FormGroup;
  loading = false;
  message = '';
  success = false;
  private readonly apiUrl = 'http://localhost:8083/ftn';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {}
  clubs: any[] = [];
  competions:any[]=[];
  ngOnInit(): void {
    this.form = this.fb.group({
      nomEntreprise: ['', Validators.required],
      nomRepresentant: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      adresse: ['', Validators.required],
      siteWeb: [''],
      matriculeFiscale: ['', Validators.required],
      typePartenariat: ['FINANCIER', Validators.required],

      // === NEW Advanced Fields ===
      proposition: ['', [Validators.required, Validators.maxLength(2000)]],
      addedValue: ['', [Validators.required, Validators.maxLength(1500)]],
      proposedBudget: [null, [Validators.min(0)]],
      targetCompetitionId: [null],
      targetClub: ['']
    });
    this.http.get<any[]>('http://localhost:8083/ftn/api/clubs')
      .subscribe({
        next: (data) => this.clubs = data,
        error: (err) => console.error(err)
      });
    this.http.get<any[]>('http://localhost:8083/ftn/api/competitions')
      .subscribe({
        next: (data) => this.competions= data,
        error: (err) => console.error(err)
      });

  }





    // Load clubs for dropdown

    submit(): void {
    this.message = '';
    this.success = false;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.value;

    this.loading = true;

    this.http.post(`${this.apiUrl}/api/partners/requests`, payload)
      .subscribe({
        next: () => {
          this.message = '✅ Demande de partenariat envoyée avec succès !';
          this.success = true;
          this.loading = false;
          this.form.reset({
            typePartenariat: 'FINANCIER'
          });
        },
        error: (err) => {
          console.error(err);
          this.message = err?.error?.message || "Une erreur est survenue lors de l'envoi.";
          this.loading = false;
        }
      });
  }
}
