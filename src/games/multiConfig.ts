import { TEMATICAS_MULTI } from '../multi/types';
import { CATEGORIAS_TRIVIA } from '../api/trivia';
import { TEMATICAS_SOPA } from '../api/sopa';
import { TEMAS_MEMOTEST } from '../api/memotest';

// Menú "¿Cómo querés jugar?" y opciones de las salas de cada juego. Son una COPIA de lo que valida
// el backend (src/rooms/modes/*.mode.ts): si cambiás una opción, cambiala en los dos repos.

export type MultiGameId = 'tutti_frutti' | 'ahorcado' | 'trivia' | 'sopa_de_letras' | 'memotest';
export const MULTI_GAMES: MultiGameId[] = ['tutti_frutti', 'ahorcado', 'trivia', 'sopa_de_letras', 'memotest'];
export const isMultiGame = (id: string | undefined): id is MultiGameId => MULTI_GAMES.includes(id as MultiGameId);

export interface Opcion<T = string> {
  id: T;
  label: string;
}

export interface MultiConfig {
  solo: { path: string; titulo: string; descripcion: string };
  tematicas?: { titulo: string; opciones: Opcion[] };
  dificultades?: Opcion[];
  rondas: { titulo: string; opciones: number[] };
  tiempos: { titulo: string; opciones: number[] };
  defaults: { tematica: string; dificultad?: string; rounds: number; seconds: number };
  maxPlayers: number;
  // Partida pública: Tutti Frutti deja elegir la temática; los demás tienen una configuración fija
  publica: { eligeTematica: boolean; descripcion: string; tamanos: ('pocos' | 'muchos')[] };
}

const DIFICULTADES: Opcion[] = [
  { id: 'facil', label: 'Fácil' },
  { id: 'medio', label: 'Medio' },
  { id: 'dificil', label: 'Difícil' },
];

export const MULTI_CONFIG: Record<MultiGameId, MultiConfig> = {
  tutti_frutti: {
    solo: { path: '/game-setup', titulo: 'Contra la IA', descripcion: 'Jugá solo contra la inteligencia artificial' },
    tematicas: { titulo: 'Temática', opciones: TEMATICAS_MULTI },
    rondas: { titulo: 'Rondas', opciones: [1, 3, 5] },
    tiempos: { titulo: 'Tiempo por ronda', opciones: [30, 45, 60, 90, 120] },
    defaults: { tematica: 'general', rounds: 3, seconds: 60 },
    maxPlayers: 8,
    publica: { eligeTematica: true, descripcion: 'Las partidas públicas son de 3 rondas de 60 segundos.', tamanos: ['pocos', 'muchos'] },
  },
  ahorcado: {
    solo: { path: '/ahorcado', titulo: 'Jugar solo', descripcion: 'Adiviná el nombre antes de que se desinfle la pelota' },
    dificultades: DIFICULTADES,
    rondas: { titulo: 'Palabras', opciones: [1, 3, 5] },
    tiempos: { titulo: 'Tiempo por palabra', opciones: [60, 90, 120] },
    defaults: { tematica: 'general', dificultad: 'medio', rounds: 3, seconds: 90 },
    maxPlayers: 8,
    publica: { eligeTematica: false, descripcion: 'Las partidas públicas son de 3 palabras de dificultad media, 90 segundos cada una.', tamanos: ['pocos', 'muchos'] },
  },
  trivia: {
    solo: { path: '/trivia', titulo: 'Jugar solo', descripcion: '10 preguntas contra el reloj' },
    tematicas: { titulo: 'Categoría', opciones: [{ id: 'todas', label: 'Todas' }, ...CATEGORIAS_TRIVIA.map((c) => ({ id: c, label: c }))] },
    dificultades: [{ id: 'mezcla', label: 'Mezcla' }, ...DIFICULTADES],
    rondas: { titulo: 'Preguntas', opciones: [5, 10, 15] },
    tiempos: { titulo: 'Tiempo por pregunta', opciones: [10, 15, 20] },
    defaults: { tematica: 'todas', dificultad: 'mezcla', rounds: 10, seconds: 20 },
    maxPlayers: 8,
    publica: { eligeTematica: false, descripcion: 'Las partidas públicas son de 10 preguntas de todas las categorías, 20 segundos cada una.', tamanos: ['pocos', 'muchos'] },
  },
  sopa_de_letras: {
    solo: { path: '/sopa-de-letras', titulo: 'Jugar solo', descripcion: 'Encontrá todas las palabras antes de que se acabe el tiempo' },
    tematicas: { titulo: 'Temática', opciones: TEMATICAS_SOPA.map((t) => ({ id: t.id, label: t.nombre })) },
    dificultades: DIFICULTADES,
    rondas: { titulo: 'Grillas', opciones: [1, 2, 3] },
    tiempos: { titulo: 'Tiempo por grilla', opciones: [120, 180, 240, 300] },
    defaults: { tematica: 'jugadores', dificultad: 'facil', rounds: 1, seconds: 180 },
    maxPlayers: 8,
    publica: { eligeTematica: false, descripcion: 'Las partidas públicas son de una grilla de dificultad media (temática al azar), con 4 minutos.', tamanos: ['pocos', 'muchos'] },
  },
  memotest: {
    solo: { path: '/memotest', titulo: 'Jugar solo', descripcion: 'Encontrá los pares lo más rápido que puedas' },
    tematicas: { titulo: 'Tema', opciones: TEMAS_MEMOTEST.map((t) => ({ id: t.id, label: t.nombre })) },
    dificultades: [
      { id: 'facil', label: 'Fácil · 12' },
      { id: 'medio', label: 'Medio · 16' },
      { id: 'dificil', label: 'Difícil · 20' },
    ],
    rondas: { titulo: 'Tableros', opciones: [1, 2, 3] },
    tiempos: { titulo: 'Tiempo por turno', opciones: [10, 15, 20] },
    defaults: { tematica: 'clubes_apodos', dificultad: 'facil', rounds: 1, seconds: 15 },
    maxPlayers: 4,
    publica: { eligeTematica: false, descripcion: 'Las partidas públicas son de un tablero de 16 cartas (tema al azar), 15 segundos por turno.', tamanos: ['pocos'] },
  },
};

// Rutas de cada juego (la pantalla anterior lógica de cada una, para el botón "Volver")
export const menuPath = (game: string) => `/juego/${isMultiGame(game) ? game : 'tutti_frutti'}`;
export const crearSalaPath = (game: string) => `${menuPath(game)}/crear-sala`;
export const publicaPath = (game: string) => `${menuPath(game)}/publica`;

// "120" → "2 min" (los tiempos largos se leen mejor en minutos)
export const tiempoLabel = (s: number) => (s >= 120 && s % 60 === 0 ? `${s / 60} min` : `${s}s`);

export const etiquetaDe = (opciones: Opcion[] | undefined, id: string | undefined) => opciones?.find((o) => o.id === id)?.label ?? id ?? '';
