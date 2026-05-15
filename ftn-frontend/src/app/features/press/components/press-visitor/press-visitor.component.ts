import { Component, OnInit } from '@angular/core';
import { PressItem, PressType } from '../../models/press-item.model';
import { PressService } from '../../services/press.service';

@Component({
  selector: 'app-press-visitor',
  templateUrl: './press-visitor.component.html',
  styleUrls: ['./press-visitor.component.css']
})
export class PressVisitorComponent implements OnInit {
  items: PressItem[] = [];
  loading = false;
  types: PressType[] = ['ARTICLE', 'VIDEO', 'PHOTO', 'COMMUNIQUE'];

  constructor(public pressService: PressService) {}

  ngOnInit(): void {
    this.loading = true;
    this.pressService.getAll().subscribe({
      next: (data) => {
        this.items = data
          .filter(item => item.status === 'PUBLISHED')
          .sort((a, b) => (b.idPressItem || 0) - (a.idPressItem || 0));
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  getItemsByType(type: string): PressItem[] {
    return this.items.filter(i => i.type === type);
  }

  openLink(url?: string): void {
    this.pressService.openLink(url);
  }
}
