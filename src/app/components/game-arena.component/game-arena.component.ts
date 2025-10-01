import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CharacterSelectionService, Personnage } from '../../services/character-selection.service';
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
  
  // État de défense - bloque les dégâts selon la valeur de defense du personnage
  playerIsDefending = false;
  computerIsDefending = false;

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
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadSelectedCharacters();
    this.updateAvailableAttacks();
  }

  /**
   * Met à jour les attaques disponibles en fonction du personnage du joueur
   */
  updateAvailableAttacks() {
    if (!this.attackCharacter) return;
    
    // Récupérer les attaques spécifiques du personnage
    const specificAttacks = this.characterAttacks[this.attackCharacter.name] || [];
    
    // Combiner avec les attaques communes
    this.availableAttacks = [...specificAttacks, ...this.commonAttacks];
    
    console.log('Attaques disponibles pour', this.attackCharacter.name, ':', this.availableAttacks);
  }

  /**
   * Récupère les personnages choisis
   */
  async loadSelectedCharacters() {
    // Récupérer les personnages depuis le service
    const defense = await this.characterSelectionService.getDefenseCharacter();
    const attack = await this.characterSelectionService.getAttackCharacter();

    // Créer de nouvelles instances avec les stats de base
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
  performAttack(attack: Attack) {
    if (!this.attackCharacter || !this.defenseCharacter || !this.gameStarted) return;

    // Vérifier si l'attaque est possible
    if (!this.canUseAttack(attack)) {
      this.addToBattleLog(`${this.attackCharacter.name} n'a pas assez d'énergie!`);
      return;
    }

    // Cas spécial: Repos
    if (attack.name === 'Repos') {
      this.attackCharacter.energie = Math.min(
        this.attackCharacter.energie + 5,
        10 // Énergie maximum
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
      this.addToBattleLog(`${this.attackCharacter.name} prend une position défensive! (Bloque ${this.attackCharacter.defense} dégâts)`);
      setTimeout(() => this.computerTurn(), 1000);
      return;
    }

    // Attaques normales
    this.attackCharacter.energie -= attack.energyCost;

    // Calculer les dégâts
    let actualDamage = attack.damage || 0;
    
    // Appliquer le blocage si l'ordinateur est en défense
    if (this.computerIsDefending) {
      actualDamage = 0;
      this.addToBattleLog(`${this.defenseCharacter.name} a bloqué complètement l'attaque !`);
      this.computerIsDefending = false;
    }

    // Appliquer les dégâts
    this.defenseCharacter.PV = Math.max(0, this.defenseCharacter.PV - actualDamage);

    // Log de l'attaque
    this.addToBattleLog(
      `${this.attackCharacter.name} utilise ${attack.name}! ` +
      `(-${attack.energyCost} énergie, ${actualDamage} dégâts)`
    );

    // Reset défense du joueur
    this.playerIsDefending = false;

    // Vérifier la victoire
    if (this.checkGameOver()) return;

    // Tour de l'ordinateur
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

    // Récupérer les attaques disponibles pour l'ordinateur
    const computerAvailableAttacks = this.getAttacksForCharacter(this.defenseCharacter);

    // L'ordinateur choisit une attaque aléatoire qu'il peut utiliser
    const usableAttacks = computerAvailableAttacks.filter(
      attack => this.defenseCharacter!.energie >= attack.energyCost
    );

    // Si pas assez d'énergie pour autre chose que Repos
    if (usableAttacks.length === 1 && usableAttacks[0].name === 'Repos') {
      this.defenseCharacter.energie = Math.min(this.defenseCharacter.energie + 5, 10);
      this.addToBattleLog(`${this.defenseCharacter.name} se repose`);
      this.computerIsDefending = false;
      return;
    }

    // Logique simple : 20% de chance de se défendre si énergie suffisante
    const shouldDefend = Math.random() < 0.2 && this.defenseCharacter.energie >= 2;
    
    if (shouldDefend) {
      this.defenseCharacter.energie -= 2;
      this.computerIsDefending = true;
      this.addToBattleLog(`${this.defenseCharacter.name} prend une position défensive! (Bloque ${this.defenseCharacter.defense} dégâts)`);
      return;
    }

    // Choisir une attaque offensive aléatoire
    const offensiveAttacks = usableAttacks.filter(
      attack => attack.name !== 'Repos' && attack.name !== 'Defense'
    );

    if (offensiveAttacks.length === 0) {
      // Pas d'attaque disponible, se reposer
      this.defenseCharacter.energie = Math.min(this.defenseCharacter.energie + 5, 10);
      this.addToBattleLog(`${this.defenseCharacter.name} se repose`);
      this.computerIsDefending = false;
      return;
    }

    const randomAttack = offensiveAttacks[Math.floor(Math.random() * offensiveAttacks.length)];

    // Consommer l'énergie
    this.defenseCharacter.energie -= randomAttack.energyCost;

    // Calculer les dégâts
    let actualDamage = randomAttack.damage || 0;
    
    // Appliquer le blocage si le joueur est en défense
    if (this.playerIsDefending) {
      actualDamage = 0;
      this.addToBattleLog(`${this.attackCharacter.name} a bloqué complètement l'attaque !`);
      this.playerIsDefending = false;
    }

    // Appliquer les dégâts
    this.attackCharacter.PV = Math.max(0, this.attackCharacter.PV - actualDamage);

    // Log
    this.addToBattleLog(
      `${this.defenseCharacter.name} utilise ${randomAttack.name}! ` +
      `(-${randomAttack.energyCost} énergie, ${actualDamage} dégâts)`
    );

    // Reset défense de l'ordinateur si c'était actif
    this.computerIsDefending = false;

    // Vérifier la victoire
    this.checkGameOver();
  }

  /**
   * Vérifie si le jeu est terminé
   */
  checkGameOver(): boolean {
    if (!this.attackCharacter || !this.defenseCharacter) return false;

    if (this.attackCharacter.PV <= 0) {
      this.gameOver = true;
      this.winner = this.defenseCharacter.name;
      this.addToBattleLog(`${this.winner} a gagné!`);
      return true;
    }

    if (this.defenseCharacter.PV <= 0) {
      this.gameOver = true;
      this.winner = this.attackCharacter.name;
      this.addToBattleLog(`${this.winner} a gagné!`);
      return true;
    }

    return false;
  }

  /**
   * Ajoute un message au journal de combat
   */
  addToBattleLog(message: string) {
    this.battleLog.push(message);
    if (this.battleLog.length > 10) {
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
    
    // Recharger les personnages avec leurs stats initiales
    await this.loadSelectedCharacters();
    
    // Mettre à jour les attaques disponibles
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
    if (confirm('Êtes-vous sûr de vouloir quitter l\'arène?')) {
      console.log('Quitter l\'arène');
      this.router.navigate(['/app-game']);
    }
  }
}