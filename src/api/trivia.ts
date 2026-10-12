import api from './axios';
import type { NewAchievement } from './achievements';

// Trivia: el servidor guarda cuál es la opción correcta, mide el tiempo y corrige.

export type DificultadTrivia = 'facil' | 'medio' | 'dificil';

export interface PreguntaTrivia {
  numero: number;
  texto: string;
  categoria: string;
  dificultad: DificultadTrivia;
  opciones: string[];
  segundos: number;
}

export interface InicioTrivia {
  matchId: string;
  total: number;
  puntos: number;
  aciertos: number;
  pregunta: PreguntaTrivia;
}

export interface RespuestaTrivia {
  correcta: boolean;
  aTiempo: boolean;
  opcionCorrecta: number;
  puntosPregunta: number;
  puntos: number;
  aciertos: number;
  total: number;
  terminada: boolean;
  pregunta: PreguntaTrivia | null;
  gano?: boolean;
  promedioSegundos?: number;
  logros?: NewAchievement[];
}

export const CATEGORIAS_TRIVIA = ['Mundiales', 'Selección', 'Clubes argentinos', 'Fútbol internacional', 'Jugadores', 'Reglamento'];

export const empezarTrivia = (filtro: { categoria?: string; dificultad?: DificultadTrivia }) =>
  api.post<InicioTrivia>('/trivia', filtro).then((r) => r.data);
export const responderTrivia = (id: string, opcion: number | null) =>
  api.post<RespuestaTrivia>(`/trivia/${id}/responder`, { opcion }).then((r) => r.data);
