import { Component, Input } from '@angular/core';

export interface AdminBreadcrumbItem {
  label: string;
  path?: string;
}

@Component({
  selector: 'app-admin-breadcrumb',
  templateUrl: './admin-breadcrumb.component.html',
  styleUrls: ['./admin-breadcrumb.component.css']
})
export class AdminBreadcrumbComponent {
  @Input() items: AdminBreadcrumbItem[] = [];
}
