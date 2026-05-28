import { Component, OnInit } from '@angular/core';
import { SwimmerService } from '../../services/swimmer.service';

@Component({
  selector: 'app-swimmer-club',
  templateUrl: './swimmer-club.component.html',
  styleUrls: ['./swimmer-club.component.css']
})
export class SwimmerClubComponent implements OnInit {
  profile: any = null;
  loading = true;

  constructor(private svc: SwimmerService) {}

  ngOnInit() {
    this.svc.getProfile().subscribe({
      next: (p) => { this.profile = p; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
