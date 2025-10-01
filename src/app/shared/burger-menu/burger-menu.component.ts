import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-burger-menu',
  templateUrl: './burger-menu.component.html',
  styleUrls: ['./burger-menu.component.css']
})
export class BurgerMenuComponent {
  isOpen = false;

  menuItems = [
    { label: 'Accueil', route: 'index.html' },
    { label: 'Jeu', route: 'app-game' },
    { label: 'Personnage', route: 'app-character-viewer' }
  ];

  constructor(private router: Router) {}

  toggleMenu(): void {
    this.isOpen = !this.isOpen;
    
    if (this.isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }

  closeMenu(): void {
    this.isOpen = false;
    document.body.style.overflow = 'auto';
  }

  navigateAndClose(route: string): void {
    if (route.includes('.html')) {
      window.location.href = route;
    } else {
      this.router.navigate([route]);
    }
    this.closeMenu();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const burgerMenu = document.querySelector('.burger-menu-container');
    
    if (this.isOpen && !burgerMenu?.contains(target)) {
      this.closeMenu();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    if (this.isOpen) {
      this.closeMenu();
    }
  }
}