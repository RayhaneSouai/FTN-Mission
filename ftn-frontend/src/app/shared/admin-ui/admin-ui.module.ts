import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminPageHeaderComponent } from './components/admin-page-header/admin-page-header.component';
import { AdminStatCardComponent } from './components/admin-stat-card/admin-stat-card.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { AdminEmptyStateComponent } from './components/admin-empty-state/admin-empty-state.component';
import { AdminToastComponent } from './components/admin-toast/admin-toast.component';
import { AdminBreadcrumbComponent } from './components/admin-breadcrumb/admin-breadcrumb.component';
import { AdminSkeletonComponent } from './components/admin-skeleton/admin-skeleton.component';
import { AdminWelcomeBannerComponent } from './components/admin-welcome-banner/admin-welcome-banner.component';
import { AdminQuickSearchComponent } from './components/admin-quick-search/admin-quick-search.component';

@NgModule({
  declarations: [
    AdminPageHeaderComponent,
    AdminStatCardComponent,
    AdminPanelComponent,
    AdminEmptyStateComponent,
    AdminToastComponent,
    AdminBreadcrumbComponent,
    AdminSkeletonComponent,
    AdminWelcomeBannerComponent,
    AdminQuickSearchComponent
  ],
  imports: [CommonModule, FormsModule, RouterModule],
  exports: [
    AdminPageHeaderComponent,
    AdminStatCardComponent,
    AdminPanelComponent,
    AdminEmptyStateComponent,
    AdminToastComponent,
    AdminBreadcrumbComponent,
    AdminSkeletonComponent,
    AdminWelcomeBannerComponent,
    AdminQuickSearchComponent
  ]
})
export class AdminUiModule {}
