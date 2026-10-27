// Lo que manda el servidor por Socket.IO (copia de los tipos de src/rooms/game-engine.ts del backend).
import type { AnswerStatus } from '../api/soloMatch';
import type { NewAchievement } from '../api/achievements';
import type { MultiGameId } from '../games/multiConfig';
import type { GameView } from './gameViews';

export type Phase = 'lobby' | 'countdown' | 'playing' | 'collecting' | 'validating' | 'results' | 'finished' | 'closed';

// Configuración de la sala: cada juego usa lo que necesita (ver games/multiConfig.ts)
export interface Settings {
  tematica: string;
  rounds: number;
  seconds: number;
  dificultad?: string;
}

export interface CellResult {
  userId: string;
  username: string;
  answer: string | null;
  status: AnswerStatus;
  canonical: string | null;
  reason: string;
  points: number;
  // Respuesta ofensiva: no vale y el backend la manda como "***" a los demás (el que la escribió ve la suya)
  ofensiva?: boolean;
}

export interface RoundResult {
  number: number;
  letter: string;
  bastaBy: string | null;
  incomplete: boolean;
  categories: { category: string; entries: CellResult[] }[];
  roundPoints: Record<string, number>;
}

export interface Standing {
  userId: string;
  username: string;
  points: number;
  position: number;
  won: boolean; // sólo el único primero: un empate arriba NO es victoria
  result?: 'win' | 'draw' | 'loss'; // draw = empató en el primer puesto
  abandoned: boolean;
}

export interface RoomPlayer {
  userId: string;
  username: string;
  avatarId: string | null;
  connected: boolean;
  left: boolean;
  isHost: boolean;
  score: number;
}

export interface RoomSnapshot {
  code: string;
  game: MultiGameId;
  isPrivate: boolean;
  me: string;
  hostUserId: string | null;
  phase: Phase;
  settings: Settings;
  minPlayers: number;
  maxPlayers: number;
  serverNow: number;
  players: RoomPlayer[];
  round: null | {
    number: number;
    total: number;
    letter: string | null;
    categories: string[];
    endsAt: number | null;
    bastaBy: string | null;
    myAnswers: Record<string, string>;
  };
  nextAt: number | null;
  lastResult: RoundResult | null;
  history: RoundResult[];
  // Juegos nuevos: lo que ve este jugador de la partida (tipos en multi/gameViews.ts)
  view: GameView | null;
  final: null | {
    reason: 'completed' | 'not_enough_players';
    countsForStats: boolean;
    standings: Standing[];
    // Empate en el primer puesto: nadie gana (nombres de los empatados)
    empate?: boolean;
    empatados?: string[];
    newAchievements: NewAchievement[];
  };
  notice: string | null;
}

export interface QueueState {
  game?: MultiGameId;
  tematica: string;
  size: 'pocos' | 'muchos';
  min: number;
  max: number;
  players: string[];
  startsAt: number | null;
  serverNow: number;
}

export type Ack = { ok: true; code?: string } | { ok: false; error: string };

// Opciones (las mismas que valida el servidor)
export const TEMATICAS_MULTI = [
  { id: 'general', label: 'General' },
  { id: 'liga_argentina', label: 'Liga Argentina' },
  { id: 'mundial', label: 'Mundial' },
  { id: 'champions', label: 'Champions' },
  { id: 'libertadores', label: 'Libertadores' },
];
export const RONDAS_MULTI = [1, 3, 5];
export const TIEMPOS_MULTI = [30, 45, 60, 90, 120];
// Partidas públicas (igual que en el backend: src/rooms/matchmaking.ts)
export const PUBLIC_ROUNDS = 3;
export const PUBLIC_SECONDS = 60;
export const temaLabel =(id: string) => TEMATICAS_MULTI.find((t) => t.id === id)?.label ?? id;
