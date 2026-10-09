import api from './axios';
import type { NewAchievement } from './achievements';

// Partida rápida contra la máquina. El servidor sortea la letra, arma las respuestas de la
// máquina y, al terminar, decide el resultado y actualiza las estadísticas.

export interface AiPlanItem {
  category: string;
  answer: string | null;
  delayMs: number;
}

export interface QuickMatch {
  matchId: string;
  letter: string;
  categories: string[];
  roundSeconds: number;
  aiPlan: AiPlanItem[];
}

// Estado de cada respuesta: valid (vale), invalid (no vale), empty (no respondió) o
// unverified (la IA no respondió: 0 puntos)
export type AnswerStatus = 'valid' | 'invalid' | 'empty' | 'unverified';

export interface CategoryResult {
  category: string;
  userAnswer: string | null;
  status: AnswerStatus;
  isValid: boolean;
  canonical: string | null; // nombre que reconoció la IA (ej. "mesi" → "Lionel Messi")
  reason: string; // motivo en español
  points: number;
  machine: {
    answer: string | null;
    status: AnswerStatus;
    isValid: boolean;
    canonical: string | null;
    reason: string;
    points: number;
  };
}

export interface QuickMatchResult {
  matchId: string;
  letter: string;
  results: CategoryResult[];
  playerPoints: number;
  aiAnswers: Record<string, string>;
  aiPoints: number;
  outcome: 'win' | 'draw' | 'loss';
  // true si la IA no pudo validar alguna respuesta: esa partida no cuenta para estadísticas
  validationIncomplete: boolean;
  newAchievements: NewAchievement[];
  stats: null | {
    matchesPlayed: number;
    matchesWon: number;
    totalPoints: number;
    currentStreak: number;
    bestStreak: number;
  };
}

export const startQuickMatch = (data: { tematica: string; dificultad: string; tiempo: number }) =>
  api.post<QuickMatch>('/solo-matches/quick', data).then((r) => r.data);

export const finishQuickMatch = (matchId: string, answers: { category: string; answer: string | null }[]) =>
  api
    .post<QuickMatchResult>(`/solo-matches/quick/${matchId}/finish`, { answers }, { timeout: 30000 })
    .then((r) => r.data);
