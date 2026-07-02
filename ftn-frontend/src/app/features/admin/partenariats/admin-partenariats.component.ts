import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ToastService} from '../../competitions/services/toast.service';

type TabType = 'partnership' | 'sponsorship';

@Component({
  selector: 'app-admin-partenariats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-partenariats.component.html',
  styleUrls: ['./admin-partenariats.component.css']
})
export class AdminPartenariatsComponent implements OnInit {

  activeTab: TabType = 'partnership';

  partnershipRequests: any[] = [];
  sponsorshipRequests: any[] = [];
  filteredPartnerships: any[] = [];

  loadingPartnerships = false;
  loadingSponsorships = false;

  searchTerm = '';
  selectedRequest: any = null;

  // Reject Modal
  showRejectModal = false;
  requestToReject: any = null;
  rejectReason = '';

  // Approve Modal
  showApproveModal = false;
  requestToApprove: any = null;
  approveNotes = '';

  constructor(private http: HttpClient,private toast: ToastService) {}

  ngOnInit(): void {
    this.loadPartnerships();
    this.loadSponsorships();
  }

  loadPartnerships() {
    this.loadingPartnerships = true;
    this.http.get<any[]>('/api/partners/requests')
      .subscribe({
        next: (data) => {
          this.partnershipRequests = data;
          this.filteredPartnerships = [...data];
          this.loadingPartnerships = false;
        },
        error: (err) => {
          console.error('Error loading partnerships:', err);
          this.loadingPartnerships = false;
        }
      });
  }

  loadSponsorships() {
    this.loadingSponsorships = true;
    this.http.get<any[]>('/api/partners/sponsorships')
      .subscribe({
        next: (data) => {
          this.sponsorshipRequests = data;
          this.loadingSponsorships = false;
        },
        error: (err) => {
          console.error('Error loading sponsorships:', err);
          this.loadingSponsorships = false;
        }
      });
  }

  filterRequests() {
    if (!this.searchTerm.trim()) {
      this.filteredPartnerships = [...this.partnershipRequests];
      return;
    }
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredPartnerships = this.partnershipRequests.filter(p =>
      p.nomEntreprise?.toLowerCase().includes(term) ||
      p.nomRepresentant?.toLowerCase().includes(term) ||
      p.addedValue?.toLowerCase().includes(term)
    );
  }

  // Approve Modal
  openApproveModal(request: any) {
    this.requestToApprove = request;
    this.approveNotes = '';
    this.showApproveModal = true;
  }

  confirmApprove() {
    if (this.requestToApprove) {
      this.reviewPartnership(this.requestToApprove.id, 'APPROVED', this.approveNotes || 'Approuvé');
    }
    this.closeApproveModal();
  }

  closeApproveModal() {
    this.showApproveModal = false;
    this.requestToApprove = null;
    this.approveNotes = '';
  }

  // Reject Modal
  openRejectModal(request: any) {
    this.requestToReject = request;
    this.rejectReason = '';
    this.showRejectModal = true;
  }

  confirmReject() {
    if (this.requestToReject && this.rejectReason.trim()) {
      this.reviewPartnership(this.requestToReject.id, 'REJECTED', this.rejectReason);
    }
    this.closeRejectModal();
  }

  closeRejectModal() {
    this.showRejectModal = false;
    this.requestToReject = null;
    this.rejectReason = '';
  }

  // Reset to Pending
  resetToPending(id: number) {
    this.reviewPartnership(id, 'PENDING', 'Réexamen demandé');
  }

  reviewPartnership(id: number, status: string, notes: string = '') {
    const token = localStorage.getItem('token');   // ou 'jwt' ou ce que tu utilises

    if (!token) {
      alert("Token non trouvé ! Veuillez vous reconnecter.");
      return;
    }

    const url = `/api/partners/requests/${id}/review?status=${status}&notes=${encodeURIComponent(notes || '')}`;

    this.http.put(url, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: () => {
        console.log(`✅ Statut changé en ${status}`);
        this.loadPartnerships();
      },
      error: (err) => {
        console.error(err);
        alert(`Erreur ${err.status} - ${err.error?.message || 'Vérifiez le token'}`);
      }
    });
  }

  toggleDetails(request: any) {
    this.selectedRequest = request;
  }

  closeDetails() {
    this.selectedRequest = null;
  }

  setTab(tab: TabType) {
    this.activeTab = tab;
  }
  selectedModel = '';
  customModel = '';

  getSuggestedModels() {
    if (!this.selectedRequest?.suggestedModels) return [];
    return this.selectedRequest.suggestedModels
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0);
  }

  approveWithModel() {
    const finalModel = this.customModel.trim() || this.selectedModel;
    if (!finalModel) {
      alert("Veuillez choisir ou saisir un modèle de collaboration");
      return;
    }

    this.http.put(`/api/partners/requests/${this.selectedRequest.id}/review?status=APPROVED&notes=&modeleDeCollaboration=${encodeURIComponent(finalModel)}`, {})
      .subscribe({
        next: () => {
          this.loadPartnerships();
          this.closeDetails();
          alert('Demande approuvée avec succès !');
        },
        error: (err) => alert('Erreur lors de l\'approbation')
      });
  }
}
