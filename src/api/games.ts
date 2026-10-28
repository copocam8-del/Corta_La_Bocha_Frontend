import api from './axios';

// Catálogo de juegos y estadísticas por juego (backend: GET /games y GET /users/me/games)

export type GameId = 'tutti_frutti' | 'ahorcado' | 'trivia' | 'trivia_diaria' | 'sopa_de_letras' | 'memotest' | 'impostor' | 'rosco';

export interface GameInfo {
  id: GameId;
  name: string;
  description: string;
  available: boolean;
  path: string; // pantalla para jugar solo
  multiplayer: boolean; // true = al elegirlo se abre el menú "¿Cómo querés jugar?" (/juego/:id)
  hasElo: boolean;
}

export interface GameStats {
  game: GameId;
  matchesPlayed: number;
  matchesWon: number;
  totalPoints: number;
  bestScore: number;
  currentStreak: number;
  bestStreak: number;
}

export const getGames = () => api.get<GameInfo[]>('/games').then((r) => r.data);
export const getMyGameStats = () => api.get<GameStats[]>('/users/me/games').then((r) => r.data);
