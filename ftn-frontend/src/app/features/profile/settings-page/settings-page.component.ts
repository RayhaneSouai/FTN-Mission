import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.css']
})
export class SettingsPageComponent implements OnInit {
  settings = {
    notifications: true,
    emailAlerts: true,
    darkMode: false,
    language: 'fr'
  };
  
  loading = false;
  success = '';

  constructor() { }

  ngOnInit(): void {
    // Load settings from local storage or service if needed
  }

  saveSettings() {
    this.loading = true;
    setTimeout(() => {
      this.success = 'Paramètres enregistrés avec succès';
      this.loading = false;
      setTimeout(() => this.success = '', 3000);
    }, 1000);
  }
}
