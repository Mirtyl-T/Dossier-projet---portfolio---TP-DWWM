import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterSelectionService, Personnage } from '../../services/character-selection.service';
import { GameEndService } from '../../services/game-end.service';
import { Router } from '@angular/router';

// Interface pour définir les types d'attaques
interface Attack {
  name: string;
  energyCost: number;
  damage?: number;
  description: string;
}

// Stats de base des personnages (constantes)
const CHARACTER_BASE_STATS: { [key: string]: { PV: number, energie: number, defense: number } } = {
  'Bot-1': { PV: 100, energie: 10, defense: 40 },
  'Bot-2': { PV: 100, energie: 5, defense: 20 }
};

@Component({
  selector: 'app-game-arena',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-arena.component.html',
  styleUrl: './game-arena.component.css'
})
export class GameArenaComponent implements OnInit {
  // Personnages
  defenseCharacter: Personnage | null = null;
  attackCharacter: Personnage | null = null;

  // État du jeu
  gameStarted = false;
  gameOver = false;
  battleLog: string[] = [];
  winner: string | null = null;
  
  // Stats pour le score
  damageDealt = 0;
  damageReceived = 0;
  attacksUsed = 0;
  
  // État de défense
  playerIsDefending = false;
  computerIsDefending = false;

  // Données du joueur
  playerData: any = null;

  // Attaque commune
  commonAttacks: Attack[] = [
    { 
      name: 'Defense', 
      energyCost: 2, 
      description: 'Prend une position défensive' 
    },
    { 
      name: 'Repos', 
      energyCost: 0, 
      damage: 0, 
      description: 'Récupère 5 points d\'énergie' 
    }
  ];

  // Attaques spécifiques par personnage
  characterAttacks: { [key: string]: Attack[] } = {
    'Bot-1': [
      { 
        name: 'QuadPunch', 
        energyCost: 3, 
        damage: 20,
        description: 'Coup de poing rapide du Bot-1' 
      }
    ],
    'Bot-2': [
      { 
        name: 'Cross Punch', 
        energyCost: 7, 
        damage: 30,
        description: 'Coup de poing puissant du Bot-2' 
      }
    ]
  };

  // Toutes les attaques disponibles pour le joueur
  availableAttacks: Attack[] = [];

  constructor(
    private characterSelectionService: CharacterSelectionService,
    private gameEndService: GameEndService,
    private router: Router
  ) {}

  async ngOnInit() {
    // Vérifier si des données joueur existent
    if (!this.gameEndService.hasPlayerData()) {
      console.warn('Aucune donnée joueur - redirection formulaire');
      alert('Veuillez d\'abord remplir le formulaire !');
      this.router.navigate(['/formulaire']);
      return;
    }

    // Récupérer les données temporaires
    this.playerData = this.gameEndService.getPlayerData();
    console.log('Joueur en attente:', this.playerData.username);

    await this.loadSelectedCharacters();
    this.updateAvailableAttacks();
  }

  /**
   * Met à jour les attaques disponibles en fonction du personnage du joueur
   */
  updateAvailableAttacks() {
    if (!this.attackCharacter) return;
    
    const specificAttacks = this.characterAttacks[this.attackCharacter.name] || [];
    this.availableAttacks = [...specificAttacks, ...this.commonAttacks];
    
    console.log('Attaques disponibles pour', this.attackCharacter.name, ':', this.availableAttacks);
  }

  /**
   * Récupère les personnages choisis
   */
  async loadSelectedCharacters() {
    const defense = await this.characterSelectionService.getDefenseCharacter();
    const attack = await this.characterSelectionService.getAttackCharacter();

    if (defense) {
      const baseStats = CHARACTER_BASE_STATS[defense.name];
      this.defenseCharacter = new Personnage(
        baseStats.PV,
        defense.attaques,
        baseStats.energie,
        baseStats.defense,
        defense.name,
        defense.imageSource
      );
    }

    if (attack) {
      const baseStats = CHARACTER_BASE_STATS[attack.name];
      this.attackCharacter = new Personnage(
        baseStats.PV,
        attack.attaques,
        baseStats.energie,
        baseStats.defense,
        attack.name,
        attack.imageSource
      );
    }

    console.log('Personnage de défense:', this.defenseCharacter);
    console.log('Personnage d\'attaque:', this.attackCharacter);

    if (!this.defenseCharacter || !this.attackCharacter) {
      console.error('Erreur: Un ou plusieurs personnages n\'ont pas été sélectionnés');
      this.addToBattleLog('Erreur: Personnages manquants');
    }
  }

  /**
   * Démarre la bataille
   */
  startBattle() {
    if (!this.defenseCharacter || !this.attackCharacter) {
      alert('Veuillez sélectionner les deux personnages!');
      return;
    }

    this.gameStarted = true;
    this.gameOver = false;
    this.battleLog = [];
    this.playerIsDefending = false;
    this.computerIsDefending = false;
    
    // Reset des stats
    this.damageDealt = 0;
    this.damageReceived = 0;
    this.attacksUsed = 0;
    
    this.addToBattleLog('La bataille commence!');
    this.addToBattleLog(`${this.attackCharacter.name} VS ${this.defenseCharacter.name}`);
    setTimeout(() => this.computerTurn(), 1000);
  }

  /**
   * Vérifie si une attaque est disponible
   */
  canUseAttack(attack: Attack): boolean {
    if (!this.attackCharacter || this.gameOver) return false;
    return this.attackCharacter.energie >= attack.energyCost;
  }

  /**
   * Retourne les dégâts d'une attaque (0 si undefined)
   */
  getAttackDamage(attack: Attack): number {
    return attack.damage || 0;
  }

  /**
   * Vérifie si une attaque a des dégâts
   */
  hasAttackDamage(attack: Attack): boolean {
    return (attack.damage || 0) > 0;
  }

  /**
   * Exécute une attaque
   */
  async performAttack(attack: Attack) {
    if (!this.attackCharacter || !this.defenseCharacter || !this.gameStarted) return;

    if (!this.canUseAttack(attack)) {
      this.addToBattleLog(`${this.attackCharacter.name} n'a pas assez d'énergie!`);
      return;
    }

    this.attacksUsed++;

    // Cas spécial: Repos
    if (attack.name === 'Repos') {
      this.attackCharacter.energie = Math.min(
        this.attackCharacter.energie + 5,
        10
      );
      this.addToBattleLog(`${this.attackCharacter.name} se repose et récupère de l'énergie`);
      this.playerIsDefending = false;
      setTimeout(() => this.computerTurn(), 1000);
      return;
    }

    // Cas spécial: Defense
    if (attack.name === 'Defense') {
      this.attackCharacter.energie -= attack.energyCost;
      this.playerIsDefending = true;
      this.addToBattleLog(`${this.attackCharacter.name} prend une position défensive!`);
      setTimeout(() => this.computerTurn(), 1000);
      return;
    }

    // Attaques normales
    this.attackCharacter.energie -= attack.energyCost;

    let actualDamage = attack.damage || 0;
    
    if (this.computerIsDefending) {
      actualDamage = 0;
      this.addToBattleLog(`${this.defenseCharacter.name} a bloqué complètement l'attaque !`);
      this.computerIsDefending = false;
    } else {
      this.damageDealt += actualDamage;
    }

    this.defenseCharacter.PV = Math.max(0, this.defenseCharacter.PV - actualDamage);

    this.addToBattleLog(
      `${this.attackCharacter.name} utilise ${attack.name}! ` +
      `(-${attack.energyCost} énergie, ${actualDamage} dégâts)`
    );

    this.playerIsDefending = false;

    if (await this.checkGameOver()) return;

    setTimeout(() => this.computerTurn(), 1000);
  }

  /**
   * Récupère les attaques disponibles pour un personnage donné
   */
  getAttacksForCharacter(character: Personnage): Attack[] {
    const specificAttacks = this.characterAttacks[character.name] || [];
    return [...specificAttacks, ...this.commonAttacks];
  }

  /**
   * Tour de l'ordinateur (IA simple)
   */
  computerTurn() {
    if (!this.attackCharacter || !this.defenseCharacter || this.gameOver) return;

    const computerAvailableAttacks = this.getAttacksForCharacter(this.defenseCharacter);

    const usableAttacks = computerAvailableAttacks.filter(
      attack => this.defenseCharacter!.energie >= attack.energyCost
    );

    if (usableAttacks.length === 1 && usableAttacks[0].name === 'Repos') {
      this.defenseCharacter.energie = Math.min(this.defenseCharacter.energie + 5, 10);
      this.addToBattleLog(`${this.defenseCharacter.name} se repose`);
      this.computerIsDefending = false;
      return;
    }

    const shouldDefend = Math.random() < 0.2 && this.defenseCharacter.energie >= 2;
    
    if (shouldDefend) {
      this.defenseCharacter.energie -= 2;
      this.computerIsDefending = true;
      this.addToBattleLog(`${this.defenseCharacter.name} prend une position défensive!`);
      return;
    }

    const offensiveAttacks = usableAttacks.filter(
      attack => attack.name !== 'Repos' && attack.name !== 'Defense'
    );

    if (offensiveAttacks.length === 0) {
      this.defenseCharacter.energie = Math.min(this.defenseCharacter.energie + 5, 10);
      this.addToBattleLog(`${this.defenseCharacter.name} se repose`);
      this.computerIsDefending = false;
      return;
    }

    const randomAttack = offensiveAttacks[Math.floor(Math.random() * offensiveAttacks.length)];

    this.defenseCharacter.energie -= randomAttack.energyCost;

    let actualDamage = randomAttack.damage || 0;
    
    if (this.playerIsDefending) {
      actualDamage = 0;
      this.addToBattleLog(`${this.attackCharacter.name} a bloqué complètement l'attaque !`);
      this.playerIsDefending = false;
    } else {
      this.damageReceived += actualDamage;
    }

    this.attackCharacter.PV = Math.max(0, this.attackCharacter.PV - actualDamage);

    this.addToBattleLog(
      `${this.defenseCharacter.name} utilise ${randomAttack.name}! ` +
      `(-${randomAttack.energyCost} énergie, ${actualDamage} dégâts)`
    );

    this.computerIsDefending = false;

    this.checkGameOver();
  }

  /**
   * Calcule le score final
   */
  calculateScore(won: boolean): number {
    let score = 0;

    // Points de base selon victoire/défaite
    if (won) {
      score += 100; // Victoire
      score += this.attackCharacter!.PV; // Bonus PV restants
    } else {
      score += 25; // Points de consolation
    }

    // Bonus dégâts infligés
    score += Math.floor(this.damageDealt / 2);

    // Malus dégâts reçus
    score -= Math.floor(this.damageReceived / 4);

    // Bonus efficacité (peu d'attaques utilisées)
    if (this.attacksUsed < 10) {
      score += 20;
    }

    return Math.max(0, score);
  }

  /**
   * Vérifie si le jeu est terminé et sauvegarde les résultats
   */
  async checkGameOver(): Promise<boolean> {
    if (!this.attackCharacter || !this.defenseCharacter) return false;

    let isGameOver = false;
    let playerWon = false;

    if (this.attackCharacter.PV <= 0) {
      isGameOver = true;
      playerWon = false;
      this.winner = this.defenseCharacter.name;
      this.addToBattleLog(`${this.winner} a gagné!`);
    }

    if (this.defenseCharacter.PV <= 0) {
      isGameOver = true;
      playerWon = true;
      this.winner = this.attackCharacter.name;
      this.addToBattleLog(`${this.winner} a gagné!`);
    }

    if (isGameOver) {
      this.gameOver = true;
      
      // Calculer le score
      const finalScore = this.calculateScore(playerWon);
      
      this.addToBattleLog('-------------------');
      this.addToBattleLog(`Score final: ${finalScore} points`);
      this.addToBattleLog(`Dégâts infligés: ${this.damageDealt}`);
      this.addToBattleLog(`Dégâts reçus: ${this.damageReceived}`);
      
      console.log('Fin de partie:', { 
        won: playerWon, 
        score: finalScore,
        character: this.attackCharacter.name 
      });

      // SAUVEGARDER LE JOUEUR AVEC SES RÉSULTATS
      try {
        await this.gameEndService.saveGameResult({
          won: playerWon,
          scoreEarned: finalScore,
          selectedCharacter: this.attackCharacter.name
        });

        this.addToBattleLog('Résultats sauvegardés !');
        console.log('Résultats sauvegardés avec succès');

      } catch (error: any) {
        console.error('Erreur sauvegarde:', error);
        this.addToBattleLog('Erreur lors de la sauvegarde...');
        alert(`Erreur: ${error.message}`);
      }

      return true;
    }

    return false;
  }

  /**
   * Ajoute un message au journal de combat
   */
  addToBattleLog(message: string) {
    this.battleLog.push(message);
    if (this.battleLog.length > 15) {
      this.battleLog.shift();
    }
  }

  /**
   * Réinitialise le jeu
   */
  async resetGame() {
    this.gameStarted = false;
    this.gameOver = false;
    this.battleLog = [];
    this.winner = null;
    this.playerIsDefending = false;
    this.computerIsDefending = false;
    this.damageDealt = 0;
    this.damageReceived = 0;
    this.attacksUsed = 0;
    
    await this.loadSelectedCharacters();
    this.updateAvailableAttacks();
  }

  /**
   * Met le jeu en pause
   */
  pauseGame() {
    this.addToBattleLog('Jeu en pause');
  }

  /**
   * Quitte l'arène
   */
  exitArena() {
    if (this.gameStarted && !this.gameOver) {
      const confirmExit = confirm(
        'La partie n\'est pas terminée. Si vous quittez maintenant, ' +
        'vos résultats ne seront pas sauvegardés. Continuer ?'
      );
      
      if (!confirmExit) return;
      
      // Nettoyer les données temporaires
      this.gameEndService.clearPlayerData();
    }

    console.log('Quitter l\'arène');
    this.router.navigate(['/app-game']);
  }

  /**
   * Rejouer (retour au formulaire pour un nouveau joueur)
   */
  playAgain() {
    this.gameEndService.clearPlayerData();
    this.router.navigate(['/formulaire']);
  }
}