import { Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { HomeComponent } from './components/home/home.component';
import { GameArenaComponent } from './components/game-arena.component/game-arena.component';
import { GameComponent } from './components/game/game.component';
import { CharacterViewerComponent } from './components/character-viewer.component/character-viewer.component';
<<<<<<< HEAD

export const routes: Routes = [
  { path: '', component: HomeComponent },
=======
import { FormulaireComponent } from './components/formulaire/formulaire.component'; 

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'formulaire', component: FormulaireComponent },
>>>>>>> master
  { path: 'app-game', component: GameComponent },
  { path: 'app-game-arena', component: GameArenaComponent },
  { path: 'app-character-viewer', component: CharacterViewerComponent },
  { path: '**', redirectTo: '' }
<<<<<<< HEAD
];
=======
];
>>>>>>> master
