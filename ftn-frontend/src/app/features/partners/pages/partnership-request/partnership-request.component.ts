import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-partnership-request',
  templateUrl: './partnership-request.component.html',
  styleUrls: [],
})
export class PartnershipRequestComponent {
  loading = false;
  message = '';

  form: any;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      nomRepresentant: ['', Validators.required],
      adresse: ['', Validators.required],
      contact: ['', Validators.required],
      matriculeFiscale: ['', Validators.required],
      typePartenariat: ['FINANCIER', Validators.required],
    });
  }

  submit(): void {
    this.message = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.http.post('http://localhost:8083/ftn/api/partners/requests', this.form.value)
      .subscribe({
        next: () => {
          this.message = 'Demande de partenariat envoyée. En attente de validation.';
          this.loading = false;
          this.form.reset({ typePartenariat: 'FINANCIER' });
        },
        error: (err) => {
          this.message = err?.error?.message || "Erreur lors de l'envoi.";
          this.loading = false;
        }
      });
  }
}

