import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  menuOpen = false;

  navLinks = [
    { label: 'Accueil', path: '/', hasDropdown: false },
    { label: 'Natation Course', path: '/natation', hasDropdown: true },
    { label: 'Water Polo', path: '/water-polo', hasDropdown: true },
    { label: 'Formation', path: '/formation', hasDropdown: true },
    { label: 'Mon Espace', path: '/espace', hasDropdown: true },
    { label: 'Actualités', path: '/actualites', hasDropdown: false },
    { label: 'Contact', path: '/contact', hasDropdown: false },
  ];
}
