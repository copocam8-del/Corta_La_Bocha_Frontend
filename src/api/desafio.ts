import api from './axios';
import type { NewAchievement } from './achievements';
import type { PreguntaTrivia } from './trivia';

// Desafío del día: la misma serie para todos, una sola vez por día (cambia a medianoche de Argentina)

export interface PreguntaDesafio extends PreguntaTrivia {
  restantes: number; // segundos que le quedan (si se retomó a la mitad)
}

export interface DesafioHoy {
  dia: string;
  preguntas: number;
  proximoEnMs: number;
  racha: number;
  jugado: boolean;
  enCurso: boolean;
  resultado?: { aciertos: number; puntos: number; marcas: string; segundos: number };
  compartir?: string;
}

export interface JugadaDesafio {
  matchId: string;
  total: number;
  puntos: number;
  aciertos: number;
  pregunta: PreguntaDesafio | null;
  terminada?: boolean;
  correcta?: boolean;
  opcionCorrecta?: number;
  gano?: boolean;
  racha?: number;
  marcas?: string;
  compartir?: string;
  logros?: NewAchievement[];
  proximoEnMs?: number;
}

export interface TablaDesafio {
  dia: string;
  jugadores: number;
  top: { posicion: number; userId: string; username: string; aciertos: number; puntos: number; segundos: number; racha: number }[];
  yo: TablaDesafio['top'][number] | null;
}

export const getDesafioHoy = () => api.get<DesafioHoy>('/desafio-diario/hoy').then((r) => r.data);
export const empezarDesafio = () => api.post<JugadaDesafio>('/desafio-diario/empezar').then((r) => r.data);
export const responderDesafio = (id: string, opcion: number | null) =>
  api.post<JugadaDesafio>(`/desafio-diario/${id}/responder`, { opcion }).then((r) => r.data);
export const getTablaDesafio = () => api.get<TablaDesafio>('/desafio-diario/tabla').then((r) => r.data);

// "VXT" → cuadraditos de colores (sin spoilers)
export const MARCA_EMOJI: Record<string, string> = { V: '🟩', X: '🟥', T: '⬛' };
export const cuadraditos = (marcas: string) => [...marcas].map((m) => MARCA_EMOJI[m] ?? '⬛').join('');

// "05:12:09" hasta el próximo desafío
export function cuentaRegresiva(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}
