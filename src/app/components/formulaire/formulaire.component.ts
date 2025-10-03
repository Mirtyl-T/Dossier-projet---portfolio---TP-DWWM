import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayerService, Player } from '../../services/player.service';
import { Router } from '@angular/router';


const woodTexture = new Image();
woodTexture.src = '/assets/images/wood-texture.png';

@Component({
  selector: 'app-formulaire',
  imports: [CommonModule, FormsModule],
  templateUrl: './formulaire.component.html',
  styleUrl: './formulaire.component.css'
})
export class FormulaireComponent {
  // Modèle pour le formulaire
  player: Omit<Player, 'id'> = {
    nom: '',
    username: '',
    email: '',
    avis: 'sympa',
    score: 0
  };


  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private playerService: PlayerService,
    private router: Router
  ) {}

  // Méthode appelée lors de la soumission du formulaire
  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    
    // Validation basique
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      // Vérifier si le joueur existe déjà
      const existingPlayer = await this.playerService.getPlayerByEmail(this.player.email);
      
      if (existingPlayer) {
        // ✅ JOUEUR EXISTANT : Sauvegarder pour mise à jour après la partie
        console.log('✅ Joueur existant détecté:', existingPlayer.id);
        
        sessionStorage.setItem('playerData', JSON.stringify({
          nom: this.player.nom,
          username: this.player.username,
          email: this.player.email,
          avis: this.player.avis,
          isExisting: true  // ⚠️ Important pour GameEndService
        }));
        
        sessionStorage.setItem('existingPlayerId', existingPlayer.id!);
        
        this.successMessage = 'Bienvenue de retour ! Bonne chance pour la partie.';
        
      } else {
        // ✅ NOUVEAU JOUEUR : Sauvegarder pour création après la partie
        console.log('✅ Nouveau joueur détecté');
        
        sessionStorage.setItem('playerData', JSON.stringify({
          nom: this.player.nom,
          username: this.player.username,
          email: this.player.email,
          avis: this.player.avis,
          isExisting: false  // ⚠️ Important pour GameEndService
        }));
        
        this.successMessage = 'Profil prêt ! Bonne chance pour votre première partie.';
      }

      console.log('✅ Données sauvegardées dans sessionStorage');
      console.log('playerData:', sessionStorage.getItem('playerData'));

      // Rediriger vers l'arène après un court délai
      setTimeout(() => {
        this.router.navigate(['/app-game-arena']);
      }, 1500);

    } catch (error) {
      console.error('❌ Erreur lors de la préparation:', error);
      this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
    } finally {
      this.isLoading = false;
    }
  }

  // Validation du formulaire
  private validateForm(): boolean {
    if (!this.player.nom.trim()) {
      this.errorMessage = 'Le nom est requis';
      return false;
    }
    if (!this.player.username.trim()) {
      this.errorMessage = 'Le pseudo est requis';
      return false;
    }
    if (!this.player.email.trim()) {
      this.errorMessage = 'L\'email est requis';
      return false;
    }
    if (!this.isValidEmail(this.player.email)) {
      this.errorMessage = 'Email invalide';
      return false;
    }
    return true;
  }

  // Validation de l'email
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Méthode pour réinitialiser le formulaire
  resetForm(): void {
    this.player = {
      nom: '',
      username: '',
      email: '',
      avis: 'sympa',
      score: 0
    };
    this.errorMessage = '';
    this.successMessage = '';
  }
}