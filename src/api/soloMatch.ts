import api from './axios';

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

export interface AnswerResult {
  category: string;
  userAnswer: string | null;
  isValid: boolean;
  reason?: string;
  points: number;
}

export interface QuickMatchResult {
  matchId: string;
  letter: string;
  results: AnswerResult[];
  playerPoints: number;
  aiAnswers: Record<string, string>;
  aiPoints: number;
  outcome: 'win' | 'draw' | 'loss';
  stats: {
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
