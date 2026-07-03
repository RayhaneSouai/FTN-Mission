import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ClubDetail, ClubMember } from '../../models/club.model';
import { ClubService } from '../../services/club.service';
import { ALL_GOVERNORATES } from '../../models/club-location.constants';
import { PageHeroComponent } from '../../../../shared/components/page-hero/page-hero.component';
import { PAGE_HERO_IMAGES } from '../../../../shared/components/page-hero/page-hero.constants';

type RosterTab = 'athletes' | 'coaches';

@Component({
  selector: 'app-club-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PageHeroComponent],
  templateUrl: './club-detail.component.html',
  styleUrl: './club-detail.component.css'
})
export class ClubDetailComponent implements OnInit {
  readonly heroImage = PAGE_HERO_IMAGES.clubs;
  club: ClubDetail | null = null;
  loading = true;
  notFound = false;
  activeRosterTab: RosterTab = 'athletes';
  searchTerm = '';

  constructor(
    private route: ActivatedRoute,
    private clubService: ClubService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.clubService.getClubDetails(id).subscribe({
      next: (detail) => {
        this.club = detail;
        this.loading = false;
      },
      error: () => {
        this.notFound = true;
        this.loading = false;
      }
    });
  }

  setRosterTab(tab: RosterTab): void {
    this.activeRosterTab = tab;
    this.searchTerm = '';
  }

  get filteredRoster(): ClubMember[] {
    const roster = this.activeRosterTab === 'athletes' ? this.club?.athletes : this.club?.coaches;
    if (!roster) return [];
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return roster;
    return roster.filter((m) =>
      m.fullName.toLowerCase().includes(term) ||
      (m.category ?? '').toLowerCase().includes(term) ||
      (m.discipline ?? '').toLowerCase().includes(term)
    );
  }

  getRegionLabel(code: string | undefined): string {
    if (!code?.trim()) return '';
    const match = ALL_GOVERNORATES.find(
      (r) => r.value === code || r.label.toLowerCase() === code.toLowerCase()
    );
    return match?.label ?? code.replace(/_/g, ' ');
  }
}
