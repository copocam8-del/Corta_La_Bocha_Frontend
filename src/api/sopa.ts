import api from './axios';
import type { NewAchievement } from './achievements';

// Sopa de letras: el servidor arma la grilla y verifica cada palabra marcada.

export type DificultadSopa = 'facil' | 'medio' | 'dificil';

export interface Celda {
  f: number;
  c: number;
}

export interface PartidaSopa {
  matchId: string;
  tematica: string;
  dificultad: DificultadSopa;
  grilla: string[];
  palabras: string[];
  encontradas: { palabra: string; celdas: Celda[] }[];
  segundos: number;
  restantes: number;
  terminada: boolean;
  ok?: boolean;
  motivo?: string;
  palabra?: string;
  gano?: boolean;
  puntos?: number;
  todas?: { palabra: string; celdas: Celda[] }[];
  logros?: NewAchievement[];
}

export const TEMATICAS_SOPA = [
  { id: 'clubes_argentinos', nombre: 'Clubes argentinos' },
  { id: 'clubes_del_mundo', nombre: 'Clubes del mundo' },
  { id: 'selecciones', nombre: 'Selecciones' },
  { id: 'jugadores', nombre: 'Jugadores' },
  { id: 'estadios', nombre: 'Estadios' },
  { id: 'tecnicos', nombre: 'Directores técnicos' },
  { id: 'palabras_futboleras', nombre: 'Palabras futboleras' },
];

export const empezarSopa = (tematica: string, dificultad: DificultadSopa) =>
  api.post<PartidaSopa>('/sopa', { tematica, dificultad }).then((r) => r.data);
export const marcarSopa = (id: string, desde: Celda, hasta: Celda) =>
  api.post<PartidaSopa>(`/sopa/${id}/marcar`, { desde, hasta }).then((r) => r.data);
export const terminarSopa = (id: string) => api.post<PartidaSopa>(`/sopa/${id}/terminar`).then((r) => r.data);
