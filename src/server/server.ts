import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment';

// Interface pour le joueur
export interface Player {
  id?: string;
  nom: string;
  username: string;
  email: string;
  avis?: string;
  selectedCharacter?: string;
  score: number;
  gamesPlayed?: number;
  wins?: number;
  losses?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface pour la réponse de l'API
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlayerService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Headers HTTP
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  // Récupérer tous les joueurs
  async getAllPlayers(): Promise<Player[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<Player[]>>(`${this.apiUrl}/players`)
      );
      
      if (response.success && response.data) {
        return response.data.map(player => ({
          ...player,
          id: (player as any)._id
        }));
      }
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération des joueurs:', error);
      throw error;
    }
  }

  // Récupérer un joueur par ID
  async getPlayerById(id: string): Promise<Player | null> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<any>>(`${this.apiUrl}/players/${id}`)
      );
      
      if (response.success && response.data) {
        return {
          ...response.data,
          id: response.data._id
        };
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du joueur:', error);
      return null;
    }
  }

  // Récupérer un joueur par email
  async getPlayerByEmail(email: string): Promise<Player | null> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<any>>(`${this.apiUrl}/players/email/${email}`)
      );
      
      if (response.success && response.data) {
        return {
          ...response.data,
          id: response.data._id
        };
      }
      return null;
    } catch (error) {
      // Si le joueur n'existe pas, retourner null au lieu de throw
      if ((error as any)?.status === 404) {
        return null;
      }
      console.error('Erreur lors de la recherche du joueur:', error);
      throw error;
    }
  }

  // Ajouter un nouveau joueur
  async addPlayer(player: Omit<Player, 'id'>): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.http.post<ApiResponse<any>>(`${this.apiUrl}/players`, player, {
          headers: this.getHeaders()
        })
      );
      
      if (response.success && response.data) {
        return response.data._id;
      }
      throw new Error('Erreur lors de la création du joueur');
    } catch (error) {
      console.error('Erreur lors de l\'ajout du joueur:', error);
      throw error;
    }
  }

  // Mettre à jour un joueur
  async updatePlayer(id: string, updates: Partial<Player>): Promise<Player> {
    try {
      const response = await firstValueFrom(
        this.http.put<ApiResponse<any>>(`${this.apiUrl}/players/${id}`, updates, {
          headers: this.getHeaders()
        })
      );
      
      if (response.success && response.data) {
        return {
          ...response.data,
          id: response.data._id
        };
      }
      throw new Error('Erreur lors de la mise à jour du joueur');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du joueur:', error);
      throw error;
    }
  }

  // Mettre à jour le score d'un joueur
  async updatePlayerScore(
    id: string, 
    won: boolean, 
    scoreEarned: number
  ): Promise<Player> {
    try {
      const response = await firstValueFrom(
        this.http.patch<ApiResponse<any>>(
          `${this.apiUrl}/players/${id}/score`,
          { won, scoreEarned },
          { headers: this.getHeaders() }
        )
      );
      
      if (response.success && response.data) {
        return {
          ...response.data,
          id: response.data._id
        };
      }
      throw new Error('Erreur lors de la mise à jour du score');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du score:', error);
      throw error;
    }
  }

  // Supprimer un joueur
  async deletePlayer(id: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.delete<ApiResponse<any>>(`${this.apiUrl}/players/${id}`)
      );
      
      return response.success;
    } catch (error) {
      console.error('Erreur lors de la suppression du joueur:', error);
      throw error;
    }
  }

  // Récupérer le classement (leaderboard)
  async getLeaderboard(limit: number = 10): Promise<Player[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<Player[]>>(
          `${this.apiUrl}/leaderboard/top?limit=${limit}`
        )
      );
      
      if (response.success && response.data) {
        return response.data.map(player => ({
          ...player,
          id: (player as any)._id
        }));
      }
      return [];
    } catch (error) {
      console.error('Erreur lors de la récupération du classement:', error);
      throw error;
    }
  }

  // Tester la connexion à l'API
  async testConnection(): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<any>>(`${this.apiUrl}/test`)
      );
      return response.success;
    } catch (error) {
      console.error('Erreur de connexion à l\'API:', error);
      return false;
    }
  }
}