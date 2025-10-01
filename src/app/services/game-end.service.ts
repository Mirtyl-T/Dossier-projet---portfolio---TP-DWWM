import { Injectable } from '@angular/core';
import { PlayerService } from './player.service';

export interface GameResult {
  won: boolean;
  scoreEarned: number;
  selectedCharacter?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GameEndService {
  constructor(private playerService: PlayerService) {}

  /**
   * Appelé à la fin de la partie pour créer/mettre à jour le joueur
   */
  async saveGameResult(gameResult: GameResult): Promise<void> {
    try {
      console.log(' Sauvegarde résultat partie:', gameResult);

      // Récupérer les données stockées temporairement
      const playerDataStr = sessionStorage.getItem('playerData');
      
      if (!playerDataStr) {
        throw new Error('Aucune donnée joueur trouvée. Retournez au formulaire.');
      }

      const playerData = JSON.parse(playerDataStr);
      console.log(' Données récupérées:', playerData);

      // Vérifier si c'est un joueur existant
      if (playerData.isExisting) {
        const existingId = sessionStorage.getItem('existingPlayerId');
        
        if (!existingId) {
          throw new Error('ID joueur existant introuvable');
        }

        console.log(' Mise à jour joueur existant:', existingId);

        // Mettre à jour le joueur existant
        await this.playerService.updatePlayer(existingId, {
          nom: playerData.nom,
          username: playerData.username,
          avis: playerData.avis,
          selectedCharacter: gameResult.selectedCharacter
        });

        // Mettre à jour le score
        await this.playerService.updatePlayerScore(
          existingId,
          gameResult.won,
          gameResult.scoreEarned
        );

        console.log(' Joueur existant mis à jour avec succès');
        
      } else {
        // Créer un nouveau joueur avec les résultats de la partie
        console.log(' Création nouveau joueur avec résultats');

        const playerId = await this.playerService.addPlayer({
          nom: playerData.nom,
          username: playerData.username,
          email: playerData.email,
          avis: playerData.avis,
          selectedCharacter: gameResult.selectedCharacter,
          score: gameResult.scoreEarned,
          gamesPlayed: 1,
          wins: gameResult.won ? 1 : 0,
          losses: gameResult.won ? 0 : 1
        });

        console.log(' Nouveau joueur créé avec ID:', playerId);
        sessionStorage.setItem('currentPlayerId', playerId);
      }

      // Nettoyer les données temporaires
      sessionStorage.removeItem('playerData');
      sessionStorage.removeItem('existingPlayerId');

      console.log(' Sauvegarde terminée avec succès');

    } catch (error) {
      console.error(' Erreur sauvegarde résultat:', error);
      throw error;
    }
  }

  /**
   * Vérifier si des données de joueur existent en attente
   */
  hasPlayerData(): boolean {
    return sessionStorage.getItem('playerData') !== null;
  }

  /**
   * Récupérer les données temporaires du joueur
   */
  getPlayerData(): any {
    const data = sessionStorage.getItem('playerData');
    return data ? JSON.parse(data) : null;
  }

  /**
   * Nettoyer les données temporaires (en cas d'abandon)
   */
  clearPlayerData(): void {
    sessionStorage.removeItem('playerData');
    sessionStorage.removeItem('existingPlayerId');
    console.log(' Données temporaires nettoyées');
  }
}