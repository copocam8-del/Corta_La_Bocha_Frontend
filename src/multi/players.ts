import type { RoomSnapshot } from './types';

// Datos de los jugadores de una sala para las pantallas de partida (src/multi/juegos/)

// Color de cada jugador (orden de llegada a la sala): sopa de letras, memotest…
export const PLAYER_COLORS = ['#39ff8c', '#fbbf24', '#60a5fa', '#f472b6', '#a78bfa', '#fb923c', '#22d3ee', '#f87171'];

export const colorOf = (state: RoomSnapshot, userId: string | null | undefined) => {
  const i = state.players.findIndex((p) => p.userId === userId);
  return i >= 0 ? PLAYER_COLORS[i % PLAYER_COLORS.length] : 'rgba(255,255,255,0.4)';
};

export const nameOf = (state: RoomSnapshot, userId: string | null | undefined) =>
  userId === state.me ? 'Vos' : (state.players.find((p) => p.userId === userId)?.username ?? '—');

// Cómo se llama cada "ronda" en cada juego
export function rondaLabel(state: RoomSnapshot) {
  switch (state.view?.kind) {
    case 'trivia': return 'Pregunta';
    case 'ahorcado': return 'Palabra';
    case 'sopa': return 'Grilla';
    case 'memotest': return 'Tablero';
    default: return 'Ronda';
  }
}

// "Ana", "Ana y Beto", "Ana, Beto y Caro" (con "e" antes de un nombre que suena "i": "Ana e Ignacio")
export function listaNombres(nombres: string[]): string {
  if (nombres.length <= 1) return nombres[0] ?? '';
  const ultimo = nombres[nombres.length - 1];
  const y = /^h?[ií](?![aeoáéó])/i.test(ultimo) ? 'e' : 'y';
  return `${nombres.slice(0, -1).join(', ')} ${y} ${ultimo}`;
}
