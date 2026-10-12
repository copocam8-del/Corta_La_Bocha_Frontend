import api from './axios';
import type { NewAchievement } from './achievements';

// Memotest: el servidor guarda el mazo boca abajo, revela cada carta y decide si es par.

export type NivelMemotest = 'facil' | 'medio' | 'dificil';
export type IconoCarta = 'escudo' | 'apodo' | 'jugador' | 'bandera' | 'estadio';

export interface CartaVista {
  indice: number;
  texto: string;
  icono: IconoCarta;
}

export interface PartidaMemotest {
  matchId: string;
  tema: string;
  nivel: NivelMemotest;
  cartas: number;
  pares: number;
  descubiertas: CartaVista[];
  movimientos: number;
  encontrados: number;
  segundos: number;
  restantes: number;
  terminada: boolean;
  carta?: CartaVista;
  primera?: CartaVista;
  par?: boolean;
  gano?: boolean;
  puntos?: number;
  logros?: NewAchievement[];
}

export const TEMAS_MEMOTEST = [
  { id: 'clubes_apodos', nombre: 'Clubes y apodos' },
  { id: 'jugadores_selecciones', nombre: 'Jugadores y selecciones' },
  { id: 'estadios_clubes', nombre: 'Estadios y clubes' },
];

export const empezarMemotest = (tema: string, nivel: NivelMemotest) =>
  api.post<PartidaMemotest>('/memotest', { tema, nivel }).then((r) => r.data);
export const voltearCarta = (id: string, carta: number) =>
  api.post<PartidaMemotest>(`/memotest/${id}/voltear`, { carta }).then((r) => r.data);
export const rendirseMemotest = (id: string) => api.post<PartidaMemotest>(`/memotest/${id}/rendirse`).then((r) => r.data);

// Columnas de la grilla según la cantidad de cartas (pensado para celular)
export const columnasMemotest = (cartas: number) => (cartas <= 12 ? 3 : 4);
