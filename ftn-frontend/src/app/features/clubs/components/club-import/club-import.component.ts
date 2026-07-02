/*import { Component, EventEmitter, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-club-import',
  templateUrl: './club-import.component.html',
  styleUrls: ['./club-import.component.css']
})
export class ClubImportComponent {

  @Output() importSuccess = new EventEmitter<any>();
  @Output() closeModal = new EventEmitter<void>();

  selectedFile: File | null = null;
  isDragging = false;
  isLoading = false;
  result: any = null;
  errorMessage = '';

  private readonly apiUrl = 'http://localhost:8083/ftn/api/clubs';

  constructor(private http: HttpClient) {}

  // Drag & Drop
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;

    const file = event.dataTransfer?.files[0];
    if (file && file.name.toLowerCase().endsWith('.csv')) {
      this.selectedFile = file;
      this.errorMessage = '';
    } else {
      this.errorMessage = 'Veuillez déposer uniquement un fichier .csv';
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.name.toLowerCase().endsWith('.csv')) {
      this.selectedFile = file;
      this.errorMessage = '';
    } else {
      this.errorMessage = 'Le fichier doit être au format CSV (.csv)';
    }
  }

  importClubs() {
    if (!this.selectedFile) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.result = null;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http.post<any>(`${this.apiUrl}/import/csv`, formData)
      .subscribe({
        next: (response) => {
          this.result = response;
          this.isLoading = false;
          this.importSuccess.emit(response);
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = err.error?.message || 'Erreur lors de l’import des clubs';
          this.isLoading = false;
        }
      });
  }

  reset() {
    this.selectedFile = null;
    this.result = null;
    this.errorMessage = '';
  }

  onClose() {
    this.reset();
    this.closeModal.emit();
  }

  downloadTemplate() {
    const csvContent = `name,region,address,contact,manager,affiliationDate
Club Nautique de Tunis,GTunis,Avenue Habib Bourguiba - Tunis,71234567,Ahmed Ben Ali,2023-05-15
Club de Natation de Sfax,Sahel,Route de Gabes - Sfax,74234567,Mohamed Trabelsi,2022-11-20
Club Olympique de Kairouan,Kairouan,Centre Ville - Kairouan,77234567,Sami Khelifi,2024-01-10`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'modele_import_clubs.csv';
    link.click();
  }

}
*/
