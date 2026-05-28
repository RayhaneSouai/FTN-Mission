import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';


type TabType = 'partnership' | 'sponsorship';

@Component({
  selector: 'app-admin-partenariats',
  standalone: true,   // 👈 THIS IS REQUIRED
  imports: [CommonModule],  // 👈 THIS FIXES ngClass / ngIf / ngFor
  templateUrl: './admin-partenariats.component.html',
  styleUrls: ['./admin-partenariats.component.css']
})
export class AdminPartenariatsComponent implements OnInit {

  activeTab: TabType = 'partnership';

  partnershipRequests: any[] = [];
  sponsorshipRequests: any[] = [];

  loadingPartnerships = false;
  loadingSponsorships = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPartnerships();
    this.loadSponsorships();
  }

  // =======================
  // LOAD DATA
  // =======================

  loadPartnerships() {
    this.loadingPartnerships = true;

    this.http.get<any[]>('/api/admin/partners/requests')
      .subscribe({
        next: (data) => {
          this.partnershipRequests = data;
          this.loadingPartnerships = false;
        },
        error: () => this.loadingPartnerships = false
      });
  }

  loadSponsorships() {
    this.loadingSponsorships = true;

    this.http.get<any[]>('/api/admin/partners/sponsorships')
      .subscribe({
        next: (data) => {
          this.sponsorshipRequests = data;
          this.loadingSponsorships = false;
        },
        error: () => this.loadingSponsorships = false
      });
  }

  // =======================
  // ACTIONS
  // =======================

  approvePartnership(id: number) {
    this.http.post(`/api/admin/partners/requests/${id}/approve`, {})
      .subscribe(() => this.loadPartnerships());
  }

  rejectPartnership(id: number) {
    this.http.post(`/api/admin/partners/requests/${id}/reject`, {})
      .subscribe(() => this.loadPartnerships());
  }

  approveSponsorship(id: number) {
    this.http.post(`/api/admin/partners/sponsorships/${id}/approve`, {})
      .subscribe(() => this.loadSponsorships());
  }

  rejectSponsorship(id: number) {
    this.http.post(`/api/admin/partners/sponsorships/${id}/reject`, {})
      .subscribe(() => this.loadSponsorships());
  }

  // =======================
  // TAB CONTROL
  // =======================

  setTab(tab: TabType) {
    this.activeTab = tab;
  }
}

