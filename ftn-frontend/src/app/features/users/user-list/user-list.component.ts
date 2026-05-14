import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';


declare var bootstrap: any;
@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: any[] = [];
  loading = true;
  error = '';
  actionInProgress = false;

  selectedUserId: number | null = null;
  isViewOnlyMode: boolean = false;
  modalTitle: string = 'Utilisateur';
  userModalInstance: any;
  deleteModalInstance: any;
  userToDeleteId: number | null = null;
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  // Helper method to get or create Bootstrap modals safely
  private getModal(elementId: string): any {
    const el = document.getElementById(elementId);
    if (el) {
      // Ensure bootstrap is available; fallback to using the declared global
      if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        return bootstrap.Modal.getOrCreateInstance(el);
      }
      if (typeof (window as any).bootstrap !== 'undefined' && (window as any).bootstrap.Modal) {
        return (window as any).bootstrap.Modal.getOrCreateInstance(el);
      }
    }
    return null;
  }

  loadUsers() {
    this.loading = true;
    this.error = '';
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        if (!data || data.length === 0) {
          this.users = [];
          this.error = '';
        } else {
          this.users = data.map((u: any) => ({
            id: u.id,
            firstName: u.firstName ?? u.first_name ?? '',
            lastName: u.lastName ?? u.last_name ?? '',
            email: u.email ?? '',
            role: u.role ?? 'VISITOR',
            active: u.active ?? false,
            registrationStatus: u.registrationStatus ?? 'CONFIRMEE'
          }));
        }
        this.updateTotalPages();
        this.loading = false;
        this.actionInProgress = false;
      },
      error: (err) => {
        this.loading = false;
        this.actionInProgress = false;
        
        let errorMsg = 'Erreur lors du chargement';
        if (err?.status === 403 || err?.status === 401) {
          errorMsg = 'Accès refusé. Vous devez être administrateur pour accéder à cette page.';
        } else if (err?.status === 404) {
          errorMsg = 'Endpoint utilisateurs non trouvé.';
        } else if (err?.status === 0) {
          errorMsg = 'Impossible de contacter le serveur. Assurez-vous que le backend est démarré sur http://localhost:8083';
        } else if (err?.error?.message) {
          errorMsg = err.error.message;
        }
        
        this.error = 'Impossible de charger les utilisateurs: ' + errorMsg;
        console.error('Load error:', err);
      }
    });
  }

  approveUser(id: number) {
    this.actionInProgress = true;
    this.userService.approveUser(id).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (err) => {
        this.actionInProgress = false;
        this.error = 'Erreur lors de l\'approbation: ' + (err?.error?.message || 'Erreur inconnue');
      }
    });
  }

  rejectUser(id: number) {
    if (confirm('Voulez-vous vraiment refuser cette inscription ?')) {
      this.actionInProgress = true;
      this.userService.rejectUser(id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (err) => {
          this.actionInProgress = false;
          this.error = 'Erreur lors du refus: ' + (err?.error?.message || 'Erreur inconnue');
        }
      });
    }
  }

  openAddModal() {
    this.selectedUserId = null;
    this.isViewOnlyMode = false;
    this.modalTitle = 'Créer un Utilisateur';
    this.userModalInstance = this.getModal('userFormModal');
    if (this.userModalInstance) this.userModalInstance.show();
  }

  openEditModal(id: number) {
    this.selectedUserId = id;
    this.isViewOnlyMode = false;
    this.modalTitle = 'Modifier un Utilisateur';
    this.userModalInstance = this.getModal('userFormModal');
    if (this.userModalInstance) this.userModalInstance.show();
  }

  openViewModal(id: number) {
    this.selectedUserId = id;
    this.isViewOnlyMode = true;
    this.modalTitle = 'Consulter un Utilisateur';
    this.userModalInstance = this.getModal('userFormModal');
    if (this.userModalInstance) this.userModalInstance.show();
  }

  closeUserModal() {
    if (this.userModalInstance) {
      this.userModalInstance.hide();
    } else {
      // Fallback
      const modal = this.getModal('userFormModal');
      if (modal) modal.hide();
    }
  }

  onFormSaved() {
    this.closeUserModal();
    this.loadUsers();
  }

  confirmDelete(id: number) {
    this.userToDeleteId = id;
    this.deleteModalInstance = this.getModal('deleteConfirmModal');
    if (this.deleteModalInstance) this.deleteModalInstance.show();
  }

  executeDelete() {
    if (this.userToDeleteId) {
      this.actionInProgress = true;
      this.userService.deleteUser(this.userToDeleteId).subscribe({
        next: () => {
          if (this.deleteModalInstance) this.deleteModalInstance.hide();
          this.loadUsers();
        },
        error: (err) => {
          this.actionInProgress = false;
          if (this.deleteModalInstance) this.deleteModalInstance.hide();
          const errorMsg = err?.error?.message || 'Erreur lors de la suppression';
          this.error = 'Erreur lors de la suppression: ' + errorMsg;
          console.error('Delete error:', err);
        }
      });
    }
  }

  // Pagination methods
  get paginatedUsers() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.users.slice(start, start + this.pageSize);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  setPage(page: number) {
    this.currentPage = page;
  }

  updateTotalPages() {
    this.totalPages = Math.ceil(this.users.length / this.pageSize);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  onSearch(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    if (!searchTerm) {
      this.loadUsers();
      return;
    }
    this.users = this.users.filter(u => 
      u.firstName?.toLowerCase().includes(searchTerm) || 
      u.lastName?.toLowerCase().includes(searchTerm) || 
      u.email?.toLowerCase().includes(searchTerm)
    );
    this.updateTotalPages();
    this.currentPage = 1;
  }
}
