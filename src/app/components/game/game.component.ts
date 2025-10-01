import { Component, OnInit } from '@angular/core';
import { FormulaireComponent } from '../formulaire/formulaire.component';
import { CommonModule } from '@angular/common';
import { CharacterSelectionService, Personnage } from '../../services/character-selection.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [CommonModule, FormulaireComponent],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent implements OnInit {
  utilisateur = {
    nom: '',
    email: '',
  };
  isSubmitted = false;

  // Variables pour stocker les personnages sélectionnés
  selectedDefenseCharacter: Personnage | null = null;
  selectedAttackCharacter: Personnage | null = null;

  constructor(
    private characterSelectionService: CharacterSelectionService,
    private router: Router
  ) {}

  async ngOnInit() {
    // Charger les personnages sélectionnés depuis le service
    await this.loadSelectedCharacters();
    
    // Initialiser avec des personnages par défaut si aucun n'est sélectionné
    if (!this.selectedDefenseCharacter) {
      await this.saveCharacterSelection('Bot-1', true);
    }
    if (!this.selectedAttackCharacter) {
      await this.saveCharacterSelection('Bot-2', false);
    }
    
    setTimeout(() => {
      this.initializeGame();
    }, 100);
  }

  // Méthode pour charger les personnages depuis le service
  async loadSelectedCharacters() {
    this.selectedDefenseCharacter = await this.characterSelectionService.getDefenseCharacter();
    this.selectedAttackCharacter = await this.characterSelectionService.getAttackCharacter();
    
    console.log('Personnage défense:', this.selectedDefenseCharacter);
    console.log('Personnage attaque:', this.selectedAttackCharacter);
  }

  // Méthode pour sauvegarder la sélection dans le service
  async saveCharacterSelection(characterName: string, isDefense: boolean) {
    const character = await this.characterSelectionService.getCharacterByName(characterName);
    
    if (character) {
      if (isDefense) {
        this.characterSelectionService.setDefenseCharacter(character);
        this.selectedDefenseCharacter = character;
      } else {
        this.characterSelectionService.setAttackCharacter(character);
        this.selectedAttackCharacter = character;
      }
      console.log(`${characterName} sauvegardé comme ${isDefense ? 'défense' : 'attaque'}`);
    }
  }

  initializeGame() {
    const buttons = document.querySelectorAll(".personnage button");
    const form = document.querySelector("form");
    const Bot1 = document.querySelector(".defense") as HTMLElement;
    const Bot2 = document.querySelector(".attack") as HTMLElement;
    const inputs = document.getElementsByTagName("input");
    const submitButton = document.querySelector("form button[type='submit']") as HTMLElement;

    let validatedInputs: HTMLInputElement[] = [];

    // Fonctions utilitaires
    const goToFightPage = () => {
      submitButton.addEventListener("click", onClickSubmitButton);
    }

    const onClickSubmitButton = (event: any) => {
      event.preventDefault();
      // Utiliser le Router Angular au lieu de window.location.href
      this.router.navigate(['/app-game-arena']);
    }

    const disabledHtmlElmt = (htmlElmt: any) => {
      htmlElmt?.classList.add("disabled");
    };

    const enabledHtmlElmt = (htmlElmt: any) => {
      htmlElmt?.classList.remove("disabled");
    };

    const enabledHtmlElmtVisible = (htmlElmt: any) => {
      htmlElmt?.classList.remove("disabled-visible");
    };

    // Gestion des inputs
    const onDetectChangeInput = (input: HTMLInputElement) => {
      if (input.value !== "" && !validatedInputs.includes(input)) {
        validatedInputs.push(input);
        console.log("Inputs validés:", validatedInputs.length);
      } else if (input.value === "" && validatedInputs.includes(input)) {
        validatedInputs = validatedInputs.filter(elmt => input !== elmt);
        console.log("Inputs validés:", validatedInputs.length);
      }
      const actualInputs = Array.from(inputs).filter(input => input.type !== "submit");
      
      if (validatedInputs.length == actualInputs.length) {
        enabledHtmlElmtVisible(submitButton);
        console.log("Tous les champs sont remplis, bouton activé!");
      } else {
        submitButton?.classList.add("disabled-visible");
      }
    };

    // Configuration des événements sur les inputs
    const checkInputs = () => {
      for (let input of inputs) {
        if (input.type !== "submit") { 
          input.addEventListener("input", (event: any) => {
            onDetectChangeInput(input);
          });
        }
      }
    };

    // Gestion de la sélection des personnages
    const showform = () => {
      for (let button of buttons) {
        button.addEventListener("click", (event: any) => {
          // Afficher le formulaire
          form?.classList.add("translate-null");
          enabledHtmlElmt(form);

          // Gestion des bots et sauvegarde dans le service
          if (button.textContent?.includes("Bot-2")) {
            console.log("Bot-2 sélectionné:", button.textContent);
            disabledHtmlElmt(Bot1);
            enabledHtmlElmt(Bot2);
            // L'utilisateur choisit Bot-2, l'ordinateur aura Bot-1
            this.saveCharacterSelection('Bot-2', false); // Utilisateur = Bot-2 (attaque)
            this.saveCharacterSelection('Bot-1', true);  // Ordinateur = Bot-1 (défense)
          } else if (button.textContent?.includes("Bot-1")) {
            console.log("Bot-1 sélectionné:", button.textContent);
            disabledHtmlElmt(Bot2);
            enabledHtmlElmt(Bot1);
            // L'utilisateur choisit Bot-1, l'ordinateur aura Bot-2
            this.saveCharacterSelection('Bot-1', false); // Utilisateur = Bot-1 (attaque)
            this.saveCharacterSelection('Bot-2', true);  // Ordinateur = Bot-2 (défense)
          }
        });
      }
    };

    // Initialisation
    showform();
    checkInputs();
    goToFightPage();
  }
}