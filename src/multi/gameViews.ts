// Lo que ve cada jugador de una partida multijugador de los juegos nuevos (campo "view" de
// room:state). Copia de lo que arma cada modo en el backend (src/rooms/modes/*.mode.ts).
// Nunca trae respuestas que el jugador no tiene que ver: la correcta de la trivia, la palabra del
// ahorcado o dónde están las palabras de la sopa llegan recién al terminar la ronda.
import type { IconoCarta } from '../api/memotest';

interface Base {
  numero: number; // ronda / pregunta / palabra / grilla / tablero actual
  total: number;
}

export interface TriviaView extends Base {
  kind: 'trivia';
  segundos: number;
  endsAt: number | null;
  pregunta: null | { texto: string; categoria: string; dificultad: string; opciones: string[] };
  miRespuesta?: number | null; // undefined = todavía no respondí
  respondieron: string[];
  revelada: null | {
    numero: number;
    correcta: number;
    resultados: { userId: string; username: string; opcion: number | null; correcta: boolean; puntos: number; ms: number }[];
  };
}

export type EstadoAhorcado = 'jugando' | 'completo' | 'muerto';

export interface AhorcadoView extends Base {
  kind: 'ahorcado';
  dificultad: string;
  maxErrores: number;
  endsAt: number | null;
  pista: string | null;
  yo: null | { mascara: string[]; adivinadas: string[]; erradas: string[]; errores: number; estado: EstadoAhorcado };
  rivales: { userId: string; username: string; errores: number; estado: EstadoAhorcado; avance: number }[];
  revelada: null | {
    numero: number;
    respuesta: string;
    resultados: { userId: string; username: string; estado: EstadoAhorcado; errores: number; segundos: number | null; puntos: number }[];
  };
}

export interface Celda {
  f: number;
  c: number;
}

export interface SopaView extends Base {
  kind: 'sopa';
  tematica: string;
  dificultad: string;
  endsAt: number | null;
  segundos: number;
  grilla: string[] | null;
  palabras: string[];
  encontradas: { palabra: string; celdas: Celda[]; userId: string; username: string }[];
  porJugador: Record<string, number>;
  revelada: null | { numero: number; todas: { palabra: string; celdas: Celda[]; userId: string | null }[] };
}

export interface CartaVista {
  indice: number;
  texto: string;
  icono: IconoCarta;
}

export interface MemotestView extends Base {
  kind: 'memotest';
  tema: string;
  nivel: string;
  cartas: number;
  pares: number;
  descubiertas: (CartaVista & { userId: string })[];
  abiertas: CartaVista[];
  mostrando: boolean;
  turno: string | null;
  turnoHasta: number | null;
  segundosTurno: number;
  paresPor: Record<string, number>;
  revelada: null | { numero: number; paresPor: Record<string, number> };
}

export type GameView = TriviaView | AhorcadoView | SopaView | MemotestView;
