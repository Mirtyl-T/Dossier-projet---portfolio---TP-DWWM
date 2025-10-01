import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlayerService, Player } from '../../services/player.service';
import { Router } from '@angular/router';

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
        // Mettre à jour le joueur existant
        await this.playerService.updatePlayer(existingPlayer.id!, {
          nom: this.player.nom,
          username: this.player.username,
          avis: this.player.avis
        });
        this.successMessage = 'Bienvenue de retour ! Vos informations ont été mises à jour.';
        
        // Stocker l'ID du joueur pour la partie
        sessionStorage.setItem('currentPlayerId', existingPlayer.id!);
      } else {
        // Créer un nouveau joueur
        const playerId = await this.playerService.addPlayer(this.player);
        this.successMessage = 'Profil créé avec succès ! Prêt à jouer ?';
        
        // Stocker l'ID du joueur pour la partie
        sessionStorage.setItem('currentPlayerId', playerId);
      }

      // Rediriger vers l'arène après un court délai
      setTimeout(() => {
        this.router.navigate(['/app-game-arena']);
      }, 1500);

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
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