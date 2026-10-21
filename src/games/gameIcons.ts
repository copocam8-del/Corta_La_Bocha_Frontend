import { CalendarCheck, CircleDot, Grid3x3, HelpCircle, Layers, Type, VenetianMask, type LucideIcon } from 'lucide-react';
import type { GameId } from '../api/games';

// Ícono de cada juego (íconos propios de lucide, sin logos de terceros)
export const GAME_ICONS: Record<GameId, LucideIcon> = {
  tutti_frutti: Type,
  ahorcado: CircleDot,
  trivia: HelpCircle,
  trivia_diaria: CalendarCheck,
  sopa_de_letras: Grid3x3,
  memotest: Layers,
  impostor: VenetianMask,
};

// Nombres para mostrar (los mismos del catálogo del backend, para no esperar a /games)
export const GAME_NAMES: Record<GameId, string> = {
  tutti_frutti: 'Tutti Frutti',
  ahorcado: 'Que no muera la redonda',
  trivia: 'Trivia',
  trivia_diaria: 'Desafío del día',
  sopa_de_letras: 'Sopa de letras',
  memotest: 'Memotest',
  impostor: 'El Impostor',
};
export const gameName = (id: string) => GAME_NAMES[id as GameId] ?? id;

export const gameIcon =(id: string): LucideIcon => GAME_ICONS[id as GameId] ?? HelpCircle;
