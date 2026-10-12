import api from './axios';
import type { NewAchievement } from './achievements';

// Ahorcado "Que no muera la redonda". El servidor elige la palabra y corrige cada letra: la
// respuesta llega recién cuando la partida termina.

export type DificultadAhorcado = 'facil' | 'medio' | 'dificil';

export interface PartidaAhorcado {
  matchId: string;
  pista: string;
  dificultad: DificultadAhorcado;
  mascara: string[]; // "_" = letra sin adivinar
  adivinadas: string[];
  erradas: string[];
  errores: number;
  maxErrores: number;
  terminada: boolean;
  // Sólo al terminar:
  gano?: boolean;
  respuesta?: string;
  puntos?: number;
  segundos?: number;
  logros?: NewAchievement[];
}

export const empezarAhorcado = (dificultad: DificultadAhorcado) =>
  api.post<PartidaAhorcado>('/ahorcado', { dificultad }).then((r) => r.data);
export const probarLetra = (id: string, letra: string) =>
  api.post<PartidaAhorcado>(`/ahorcado/${id}/letra`, { letra }).then((r) => r.data);
export const arriesgarRespuesta = (id: string, respuesta: string) =>
  api.post<PartidaAhorcado>(`/ahorcado/${id}/arriesgar`, { respuesta }).then((r) => r.data);
export const rendirse = (id: string) => api.post<PartidaAhorcado>(`/ahorcado/${id}/rendirse`).then((r) => r.data);
