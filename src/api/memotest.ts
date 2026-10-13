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
  { id: 'jugadores_apodos', nombre: 'Jugadores y apodos' },
  { id: 'selecciones_apodos', nombre: 'Selecciones y apodos' },
];

export const empezarMemotest = (tema: string, nivel: NivelMemotest) =>
  api.post<PartidaMemotest>('/memotest', { tema, nivel }).then((r) => r.data);
export const voltearCarta = (id: string, carta: number) =>
  api.post<PartidaMemotest>(`/memotest/${id}/voltear`, { carta }).then((r) => r.data);
export const rendirseMemotest = (id: string) => api.post<PartidaMemotest>(`/memotest/${id}/rendirse`).then((r) => r.data);

// ── Tablero que se adapta a la pantalla ──────────────────────────────────────────────────────
// PC (horizontal): más columnas que filas. Celular (vertical): más filas que columnas. Siempre una
// grilla completa, sin huecos: 12 cartas = 6×2 / 3×4, 16 = 8×2 (o 4×4 si no entra) / 4×4, 20 = 5×4 / 4×5.
export type OrientacionMemotest = 'horizontal' | 'vertical';

export const ANCHO_CELULAR = 700; // menos que esto (o la pantalla parada) = celular
export const ANCHO_OCHO_COLUMNAS = 900; // 16 cartas en 8×2 sólo con lugar para cartas que se lean bien
export const MESA_PC = 960; // ancho máximo de la mesa en la PC

export function orientacionDe(ancho: number, alto: number): OrientacionMemotest {
  return ancho < ANCHO_CELULAR || alto > ancho ? 'vertical' : 'horizontal';
}

const HORIZONTAL: Record<number, number> = { 12: 6, 20: 5 };
const VERTICAL: Record<number, number> = { 12: 3, 16: 4, 20: 4 };

export function columnasMemotest(cartas: number, orientacion: OrientacionMemotest = 'vertical', ancho = Infinity): number {
  if (orientacion === 'horizontal') {
    if (cartas === 16) return ancho >= ANCHO_OCHO_COLUMNAS ? 8 : 4;
    if (HORIZONTAL[cartas]) return HORIZONTAL[cartas];
  } else if (VERTICAL[cartas]) {
    return VERTICAL[cartas];
  }
  // Otra cantidad: el divisor más cercano a la raíz (para el lado que corresponda), así no quedan huecos
  const divisores = Array.from({ length: cartas }, (_, i) => i + 1).filter((d) => cartas % d === 0);
  const raiz = Math.sqrt(cartas);
  return orientacion === 'horizontal'
    ? (divisores.find((d) => d >= raiz) ?? cartas)
    : ([...divisores].reverse().find((d) => d <= raiz) ?? 1);
}

// Tamaño de la carta y de la letra para que se lea bien: en la PC, cartas apaisadas (el tablero
// entra a lo alto); en el celular, paradas. Con muchas columnas, letra un poco más chica.
export function medidasCarta(orientacion: OrientacionMemotest, columnas: number) {
  if (orientacion === 'horizontal') {
    return { aspectRatio: '4 / 3', fontSize: columnas >= 8 ? 12 : 14, icono: columnas >= 8 ? 18 : 22 };
  }
  return { aspectRatio: '3 / 4', fontSize: columnas >= 4 ? 11 : 12, icono: columnas >= 4 ? 18 : 20 };
}
