import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { UserService } from '../../users/services/user.service';
import { ClubService } from '../../clubs/services/club.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { LicenseService } from '../../licenses/services/license.service';

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.css']
})
export class ProfilePageComponent implements OnInit {
  user: any = null;
  loading = true;
  error = '';
  success = '';
  activeTab: 'info' | 'security' | 'club' = 'info';
  showConfirmModal = false;
  showSuccessModal = false;
  resetError = '';
  confirmLoading = false;
  isReadOnly = false;

  // Swimmer License (Individual specific)
  isSwimmer = false;
  myLicenses: any[] = [];
  myLicenseLoading = false;
  selectedSwimmerLicenseForDetail: any = null;

  // Club season validation (Coach/Manager specific)
  isCoach = false;
  currentSeason = '2026/2027';
  clubValidations: any[] = [];
  clubValidationLoading = false;

  // Premium validation control panel features
  isDeclarationChecked = false;
  showErrorReportModal = false;
  showRefusalModal = false;
  selectedValidationForDetail: any = null;
  selectedErrorFields = {
    manager: false,
    contact: false,
    address: false,
    region: false,
    affiliationDate: false
  };
  errorDescription = '';
  refusalReason = '';
  refusalReasonCategory = '';
  reportedErrorSuccess = '';

  constructor(
    private userService: UserService,
    private clubService: ClubService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private licenseService: LicenseService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadProfile();
      this.route.queryParams.subscribe(params => {
        if (params['tab'] === 'club') {
          this.activeTab = 'club';
        }
      });
    }
  }

  loadProfile() {
    if (isPlatformBrowser(this.platformId)) {
      this.loading = true;
      const userStr = sessionStorage.getItem('user');
      if (userStr) {
        const storedUser = JSON.parse(userStr);
        this.userService.getUserById(storedUser.id).subscribe({
          next: (data) => {
            this.user = data;
            this.loading = false;
            this.isReadOnly = data.role === 'SWIMMER' || data.role === 'NAGEUR';
            this.isSwimmer = data.role === 'SWIMMER' || data.role === 'NAGEUR';
            this.isCoach = data.role === 'COACH' || data.role === 'ENTRAINEUR';
            if (this.isCoach) {
              this.checkClubValidation();
            }
            if (this.isSwimmer && !data.clubId) {
              this.loadMyLicenses();
            }
          },
          error: (err) => {
            this.error = 'Erreur lors du chargement du profil';
            this.loading = false;
            console.error(err);
          }
        });
      } else {
        this.error = 'Utilisateur non connecté';
        this.loading = false;
      }
    }
  }

  saveProfile() {
    if (isPlatformBrowser(this.platformId)) {
      this.loading = true;
      this.userService.updateUser(this.user.id, this.user).subscribe({
        next: (data) => {
          this.user = data;
          this.authService.setUser(data);
          this.success = 'Profil mis à jour avec succès';
          this.loading = false;
          setTimeout(() => this.success = '', 3000);
        },
        error: (err) => {
          this.error = 'Erreur lors de la mise à jour du profil';
          this.loading = false;
          console.error(err);
        }
      });
    }
  }

  openConfirmModal() {
    this.showConfirmModal = true;
    this.resetError = '';
  }

  closeConfirmModal() {
    this.showConfirmModal = false;
  }

  closeSuccessModal() {
    this.showSuccessModal = false;
  }

  triggerPasswordReset() {
    this.confirmLoading = true;
    this.resetError = '';
    this.userService.requestPasswordChange().subscribe({
      next: () => {
        this.confirmLoading = false;
        this.showConfirmModal = false;
        this.showSuccessModal = true;
      },
      error: (err) => {
        this.confirmLoading = false;
        this.resetError = err?.error?.message || "Erreur lors de l'envoi de l'e-mail de réinitialisation.";
        console.error(err);
      }
    });
  }

  levelLabels: Record<string, string> = {
    POUSSIN: 'Poussin',
    BENJAMIN: 'Benjamin',
    MINIME: 'Minime',
    CADET: 'Cadet',
    JUNIOR: 'Junior',
    SENIOR: 'Senior',
    MASTER: 'Master'
  };

  checkClubValidation() {
    this.clubService.getSeasonValidationStatus(this.currentSeason).subscribe({
      next: (res: any[]) => {
        this.clubValidations = (res || []).map(val => ({
          ...val,
          currentStep: 1,
          details: null,
          detailsLoading: true,
          stats: null,
          statsLoading: true,
          statsError: false
        }));

        this.clubValidations.forEach(val => {
          // Load details
          this.clubService.getById(val.clubId).subscribe({
            next: (clubDetails) => {
              val.details = clubDetails;
              val.detailsLoading = false;
            },
            error: (err) => {
              console.error('Error fetching details for club ' + val.clubId, err);
              val.detailsLoading = false;
            }
          });

          // Load stats
          this.clubService.getStatistics(val.clubId).subscribe({
            next: (statsData) => {
              val.stats = statsData;
              val.statsLoading = false;
            },
            error: (err) => {
              console.error('Error fetching statistics for club ' + val.clubId, err);
              val.statsLoading = false;
              val.statsError = true;
            }
          });
        });
      },
      error: (err) => {
        console.error('Erreur validation saison', err);
      }
    });
  }

  validateClubSeason(clubId: number, isValidated: boolean = true) {
    this.clubValidationLoading = true;
    this.error = '';
    this.success = '';
    this.clubService.validateSeason(this.currentSeason, clubId, isValidated).subscribe({
      next: (res: any) => {
        this.success = isValidated 
          ? `La saison ${this.currentSeason} a été validée avec succès !`
          : `La saison ${this.currentSeason} a été refusée.`;
        this.clubValidationLoading = false;
        this.isDeclarationChecked = false; // Reset checkbox on completion
        
        if (this.selectedValidationForDetail && this.selectedValidationForDetail.clubId === clubId) {
          this.selectedValidationForDetail.status = isValidated ? 'VALIDATED' : 'REFUSED';
          this.selectedValidationForDetail.validatedAt = (res && res.validatedAt) ? res.validatedAt : new Date();
        }

        this.checkClubValidation();
        setTimeout(() => this.success = '', 5000);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Erreur lors de la validation de la saison';
        this.clubValidationLoading = false;
        setTimeout(() => this.error = '', 5000);
      }
    });
  }

  pendingLicenses: any[] = [];
  pendingLicensesLoading = false;

  openValidationDetail(validation: any) {
    this.selectedValidationForDetail = validation;
    this.isDeclarationChecked = false;
    this.loadPendingLicensesForClub(validation.clubId);
  }

  loadPendingLicensesForClub(clubId: number) {
    this.pendingLicensesLoading = true;
    this.licenseService.getAllLicenses().subscribe({
      next: (licenses: any[]) => {
        this.pendingLicenses = licenses.filter(l => 
          l.club && l.club.id === clubId && l.validationStatus === 'PENDING' && l.season === this.currentSeason
        );
        this.pendingLicensesLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement licences', err);
        this.pendingLicensesLoading = false;
      }
    });
  }

  validatePendingLicense(licenseId: number, approved: boolean) {
    this.licenseService.makeDecision(licenseId, approved).subscribe({
      next: () => {
        this.success = 'Licence traitée avec succès';
        setTimeout(() => this.success = '', 3000);
        if (this.selectedValidationForDetail) {
          this.loadPendingLicensesForClub(this.selectedValidationForDetail.clubId);
        }
      },
      error: (err) => {
        this.error = err?.error?.message || 'Erreur lors du traitement de la licence';
        setTimeout(() => this.error = '', 5000);
      }
    });
  }

  closeValidationDetail() {
    this.selectedValidationForDetail = null;
    this.isDeclarationChecked = false;
  }

  toggleErrorReportModal(show: boolean) {
    this.showErrorReportModal = show;
    if (!show) {
      this.selectedErrorFields = {
        manager: false,
        contact: false,
        address: false,
        region: false,
        affiliationDate: false
      };
      this.errorDescription = '';
      this.reportedErrorSuccess = '';
    }
  }

  isFieldSelectedForError(): boolean {
    return Object.values(this.selectedErrorFields).some(val => val);
  }

  submitErrorReport(clubId: number) {
    if (!this.isFieldSelectedForError()) {
      return;
    }

    const fields: string[] = [];
    if (this.selectedErrorFields.manager) fields.push('manager');
    if (this.selectedErrorFields.contact) fields.push('contact');
    if (this.selectedErrorFields.address) fields.push('address');
    if (this.selectedErrorFields.region) fields.push('region');
    if (this.selectedErrorFields.affiliationDate) fields.push('affiliationDate');

    this.clubService.reportAdminError({
      clubId,
      season: this.currentSeason,
      fields,
      description: this.errorDescription
    }).subscribe({
      next: (res) => {
        this.reportedErrorSuccess = res.message;
        setTimeout(() => this.toggleErrorReportModal(false), 3000);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Erreur lors de l\'envoi du signalement';
        setTimeout(() => this.error = '', 5000);
      }
    });
  }

  toggleRefusalModal(show: boolean) {
    this.showRefusalModal = show;
    if (!show) {
      this.refusalReason = '';
      this.refusalReasonCategory = '';
    }
  }

  confirmRefusal(clubId: number) {
    if (!this.refusalReasonCategory) {
      return;
    }
    this.validateClubSeason(clubId, false);
    this.toggleRefusalModal(false);
  }

  getLevelLabel(key: any): string {
    const keyStr = String(key || '');
    return this.levelLabels[keyStr] || keyStr;
  }

  getPercent(value: any, total: any): number {
    const valNum = Number(value) || 0;
    const totalNum = Number(total) || 0;
    if (totalNum === 0) return 0;
    return (valNum / totalNum) * 100;
  }

  loadMyLicenses() {
    this.myLicenseLoading = true;
    this.licenseService.getMyLicenses().subscribe({
      next: (data) => {
        this.myLicenses = data || [];
        this.myLicenseLoading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des licences', err);
        this.myLicenseLoading = false;
      }
    });
  }

  openSwimmerLicenseDetail(license: any) {
    this.selectedSwimmerLicenseForDetail = license;
    this.isDeclarationChecked = false;
  }

  closeSwimmerLicenseDetail() {
    this.selectedSwimmerLicenseForDetail = null;
    this.isDeclarationChecked = false;
  }

  validateMyIndependentLicense(licenseId: number, isValidated: boolean) {
    this.clubValidationLoading = true;
    this.error = '';
    this.success = '';
    
    this.licenseService.makeDecision(licenseId, isValidated).subscribe({
      next: (res) => {
        this.success = isValidated 
          ? `Votre licence a été validée avec succès !`
          : `La licence a été refusée.`;
        this.clubValidationLoading = false;
        this.isDeclarationChecked = false;
        this.selectedSwimmerLicenseForDetail = null;
        this.loadMyLicenses();
        setTimeout(() => this.success = '', 5000);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Erreur lors de la validation de la licence';
        this.clubValidationLoading = false;
        setTimeout(() => this.error = '', 5000);
      }
    });
  }
}
