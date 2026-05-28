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
  private readonly apiUrl = 'http://localhost:8083/ftn';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nomEntreprise: ['', Validators.required],
      nomRepresentant: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      adresse: ['', Validators.required],
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

    const payload = this.form.value;

    console.log('PARTNERSHIP PAYLOAD:', payload);

    this.loading = true;

    this.http.post(
      'http://localhost:8083/ftn/api/partners/requests',
      payload
    ).subscribe({
      next: () => {
        this.message = 'Demande envoyée.';
        this.loading = false;
        this.form.reset({
          typePartenariat: 'FINANCIER'
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
