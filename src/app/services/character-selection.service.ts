import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Définir l'interface Personnage
export class Personnage {
  PV: number;
  attaques: string[];
  energie: number;
  defense: number;
  name: string;
  imageSource: string;
  
  constructor(
    PV: number,
    attaques: string[],
    energie: number,
    defense: number,
    name: string,
    imageSource: string
  ) {
    this.PV = PV;
    this.attaques = attaques;
    this.energie = energie;
    this.defense = defense;
    this.name = name;
    this.imageSource = imageSource;
  }
}

@Injectable({
  providedIn: 'root'
})
export class CharacterSelectionService {
  // BehaviorSubjects pour stocker les personnages sélectionnés
  private selectedDefenseCharacter$ = new BehaviorSubject<Personnage | null>(null);
  private selectedAttackCharacter$ = new BehaviorSubject<Personnage | null>(null);

  // Liste des personnages disponibles
  private availableCharacters: Personnage[] = [
    new Personnage(
      100,
      ['QuadPunch'],
      10,
      40,
      'Bot-1',
      "assets/images/Posing__Tower.webp"
    ),
    new Personnage(
      120,
      ['Cross Punch'],
      5,
      10,
      'Bot-2',
      "assets/images/Posing_Pion.webp"
    ),
  ];

  constructor() {}

  // Méthodes pour récupérer les personnages (retourne des Promises)
  async getDefenseCharacter(): Promise<Personnage | null> {
    // Simulation d'un appel asynchrone (délai de 500ms)
    await this.delay(500);
    return this.selectedDefenseCharacter$.value;
  }

  async getAttackCharacter(): Promise<Personnage | null> {
    await this.delay(500);
    return this.selectedAttackCharacter$.value;
  }
  
  async getCharacterByName(name: string): Promise<Personnage | null> {
    await this.delay(200);
    return this.availableCharacters.find(char => char.name === name) || null;
  }

  // Méthodes pour définir les personnages
  setDefenseCharacter(character: Personnage): void {
    this.selectedDefenseCharacter$.next(character);
  }

  setAttackCharacter(character: Personnage): void {
    this.selectedAttackCharacter$.next(character);
  }

  // Méthodes observables (si vous voulez aussi les utiliser)
  getDefenseCharacterObservable(): Observable<Personnage | null> {
    return this.selectedDefenseCharacter$.asObservable();
  }

  getAttackCharacterObservable(): Observable<Personnage | null> {
    return this.selectedAttackCharacter$.asObservable();
  }

  // Méthode utilitaire pour simuler un délai
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Initialiser avec des personnages par défaut
  async initializeDefaultCharacters(): Promise<void> {
    const defenseChar = await this.getCharacterByName('Bot-1');
    const attackChar = await this.getCharacterByName('Bot-2');
    
    if (defenseChar) this.setDefenseCharacter(defenseChar);
    if (attackChar) this.setAttackCharacter(attackChar);
  }
}