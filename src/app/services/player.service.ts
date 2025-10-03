import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Player {
  _id?: string;
  id?: string;
  nom: string;
  username: string;
  email: string;
  avis: string;
  selectedCharacter?: string;
  score?: number;
  gamesPlayed?: number;
  wins?: number;
  losses?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private apiUrl = environment.apiUrl || 'https://dossier-projet-portfolio-tp-dwwm.onrender.com/api';
  private playersEndpoint = `${this.apiUrl}/players`;

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  // Ajouter un nouveau joueur
  async addPlayer(playerData: Omit<Player, 'id' | '_id'>): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<Player>>(
          this.playersEndpoint,
          playerData,
          this.httpOptions
        )
      );
      
      if (response.success && response.data) {
        console.log('Joueur ajouté avec ID:', response.data._id);
        return response.data._id || '';
      }
      throw new Error(response.message || 'Erreur lors de l\'ajout du joueur');
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout du joueur:', error);
      throw error;
    }
  }

  // Récupérer tous les joueurs (Observable)
  getAllPlayersObservable(): Observable<Player[]> {
    return new Observable(observer => {
      this.http.get<ApiResponse<Player[]>>(this.playersEndpoint)
        .subscribe({
          next: (response) => {
            if (response.success && response.data) {
              observer.next(response.data);
            } else {
              observer.error('Erreur lors de la récupération des joueurs');
            }
          },
          error: (error) => observer.error(error),
          complete: () => observer.complete()
        });
    });
  }

  // Récupérer tous les joueurs (Promise)
  async getAllPlayers(): Promise<Player[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<Player[]>>(this.playersEndpoint)
      );
      
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des joueurs:', error);
      throw error;
    }
  }

  // Récupérer un joueur par email
  async getPlayerByEmail(email: string): Promise<Player | null> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<Player>>(`${this.playersEndpoint}/email/${email}`)
      );
      
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      console.error('Erreur lors de la recherche du joueur:', error);
      throw error;
    }
  }

  // Récupérer un joueur par ID
  getPlayerById(playerId: string): Observable<Player | undefined> {
    return new Observable(observer => {
      this.http.get<ApiResponse<Player>>(`${this.playersEndpoint}/${playerId}`)
        .subscribe({
          next: (response) => {
            if (response.success && response.data) {
              observer.next(response.data);
            } else {
              observer.next(undefined);
            }
          },
          error: (error) => {
            console.error('Erreur:', error);
            observer.next(undefined);
          },
          complete: () => observer.complete()
        });
    });
  }

  // Mettre à jour un joueur
  async updatePlayer(playerId: string, data: Partial<Player>): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.put<ApiResponse<Player>>(
          `${this.playersEndpoint}/${playerId}`,
          data,
          this.httpOptions
        )
      );
      
      if (response.success) {
        console.log('Joueur mis à jour avec succès');
      } else {
        throw new Error(response.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      throw error;
    }
  }

  // Mettre à jour le score d'un joueur
  async updatePlayerScore(playerId: string, won: boolean, scoreEarned: number = 0): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.patch<ApiResponse<Player>>(
          `${this.playersEndpoint}/${playerId}/score`,
          { won, scoreEarned },
          this.httpOptions
        )
      );
      
      if (!response.success) {
        throw new Error(response.message || 'Erreur lors de la mise à jour du score');
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du score:', error);
      throw error;
    }
  }

  // Supprimer un joueur
  async deletePlayer(playerId: string): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.delete<ApiResponse<any>>(`${this.playersEndpoint}/${playerId}`)
      );
      
      if (response.success) {
        console.log('Joueur supprimé avec succès');
      } else {
        throw new Error(response.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      throw error;
    }
  }

  // Obtenir le classement (top scores)
  async getLeaderboard(limit: number = 10): Promise<Player[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<Player[]>>(
          `${this.playersEndpoint}/leaderboard/top?limit=${limit}`
        )
      );
      
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération du classement:', error);
      throw error;
    }
  }
}