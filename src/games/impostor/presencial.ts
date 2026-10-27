import type { PalabraEnPersona } from '../../api/impostor';

// El Impostor "En persona" (un solo celular que se pasan): reglas que corren en el navegador.
// Las palabras las da el backend (POST /impostor/local); el impostor, quién empieza y todo lo demás
// se decide acá. Sin pantallas ni red: se prueba en impostorPresencial.test.ts.

export const MIN_JUGADORES = 3;
export const MAX_JUGADORES = 12;
export const NOMBRE_MAX = 20;
export const VUELTAS = 2; // vueltas de pistas en voz alta
const GUARDADOS = 'impostor-en-persona-nombres';
const AJUSTES = 'impostor-en-persona-ajustes';

export interface RondaEnPersona {
  numero: number;
  palabra: string;
  categoria: string;
  impostores: number[]; // índices en la lista de jugadores (uno o más, ordenados)
  empieza: number; // quién da la primera pista
}

// Cuántos impostores puede haber: 1 con 3-4 jugadores, 2 con 5-7 y 3 con 8 o más (mínimo siempre 1)
export function maxImpostores(cantidadJugadores: number): number {
  if (cantidadJugadores >= 8) return 3;
  if (cantidadJugadores >= 5) return 2;
  return 1;
}

// Deja la cantidad de impostores dentro de lo permitido (ej. si sacaron jugadores)
export const ajustarImpostores = (cantidad: number, cantidadJugadores: number) =>
  Math.min(Math.max(1, Math.floor(cantidad) || 1), maxImpostores(cantidadJugadores));

// Sin espacios de más
export const limpiarNombre = (nombre: string) => nombre.replace(/\s+/g, ' ').trim();

// Para comparar repetidos: sin tildes ni mayúsculas ("Agus" = "agus" = "ÁGUS")
const clave = (nombre: string) =>
  limpiarNombre(nombre).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

// Por qué no se puede agregar este nombre (null = se puede)
export function errorNombre(nombre: string, jugadores: string[]): string | null {
  const limpio = limpiarNombre(nombre);
  if (!limpio) return 'Escribí un nombre.';
  if (limpio.length > NOMBRE_MAX) return `Máximo ${NOMBRE_MAX} caracteres.`;
  if (jugadores.length >= MAX_JUGADORES) return `Pueden jugar hasta ${MAX_JUGADORES}.`;
  if (jugadores.some((j) => clave(j) === clave(limpio))) return 'Ese nombre ya está.';
  return null;
}

// El impostor de cada ronda: al azar entre los que MENOS veces lo fueron (así rota y le toca a todos)
export function elegirImpostor(veces: number[], azar: () => number = Math.random): number {
  const min = Math.min(...veces);
  const candidatos = veces.flatMap((v, i) => (v === min ? [i] : []));
  return candidatos[Math.floor(azar() * candidatos.length)];
}

// Varios impostores distintos en la misma ronda: uno por uno, siempre entre los que MENOS veces lo fueron
export function elegirImpostores(veces: number[], cantidad: number, azar: () => number = Math.random): number[] {
  const elegidos: number[] = [];
  for (let k = 0; k < Math.min(cantidad, veces.length); k++) {
    // Los ya elegidos en esta ronda no cuentan (Infinity = nunca son el mínimo)
    const i = elegirImpostor(veces.map((v, j) => (elegidos.includes(j) ? Infinity : v)), azar);
    elegidos.push(i);
  }
  return elegidos.sort((a, b) => a - b);
}

// Todas las rondas de la partida (una por palabra): impostores rotando y quién empieza al azar
export function armarRondas(
  cantidadJugadores: number,
  palabras: PalabraEnPersona[],
  cantidadImpostores = 1,
  azar: () => number = Math.random,
): RondaEnPersona[] {
  const veces = Array.from({ length: cantidadJugadores }, () => 0);
  const cantidad = ajustarImpostores(cantidadImpostores, cantidadJugadores);
  return palabras.map((p, i) => {
    const impostores = elegirImpostores(veces, cantidad, azar);
    for (const j of impostores) veces[j] += 1;
    return { numero: i + 1, palabra: p.texto, categoria: p.categoria, impostores, empieza: Math.floor(azar() * cantidadJugadores) };
  });
}

// Lo que ve cada jugador al levantar la tarjeta. El impostor nunca recibe la palabra; la categoría sólo
// si la pista está prendida. Las pantallas dibujan SÓLO esto (así no hay forma de mostrar de más).
export type Secreto =
  | { rol: 'impostor'; categoria: string | null; companeros: number }
  | { rol: 'hincha'; palabra: string; categoria: string };

export function secretoDe(ronda: RondaEnPersona, jugador: number, pista: boolean): Secreto {
  if (ronda.impostores.includes(jugador)) {
    return { rol: 'impostor', categoria: pista ? ronda.categoria : null, companeros: ronda.impostores.length - 1 };
  }
  return { rol: 'hincha', palabra: ronda.palabra, categoria: ronda.categoria };
}

// Orden de las pistas: arranca "empieza" y sigue la ronda (como sentados en ronda), dos vueltas
export function ordenPistas(cantidadJugadores: number, empieza: number): number[][] {
  const vuelta = Array.from({ length: cantidadJugadores }, (_, i) => (empieza + i) % cantidadJugadores);
  return Array.from({ length: VUELTAS }, () => vuelta);
}

// Los últimos nombres que jugaron en este celular (localStorage puede no estar o fallar: nunca rompe)
export function leerNombresGuardados(): string[] {
  try {
    const crudo: unknown = JSON.parse(localStorage.getItem(GUARDADOS) ?? '[]');
    if (!Array.isArray(crudo)) return [];
    const out: string[] = [];
    for (const n of crudo) if (typeof n === 'string' && !errorNombre(n, out)) out.push(limpiarNombre(n));
    return out;
  } catch {
    return [];
  }
}

export function guardarNombres(nombres: string[]) {
  try {
    localStorage.setItem(GUARDADOS, JSON.stringify(nombres));
  } catch {
    // Sin localStorage (modo privado, bloqueado…): la próxima vez se escriben de nuevo
  }
}

// Ajustes de la partida en este celular (impostores y pista). Igual que los nombres: si falla, valores por defecto.
export interface AjustesEnPersona {
  impostores: number;
  pista: boolean; // true = el impostor ve la categoría
}

export const AJUSTES_POR_DEFECTO: AjustesEnPersona = { impostores: 1, pista: true };

export function leerAjustes(): AjustesEnPersona {
  try {
    const crudo: unknown = JSON.parse(localStorage.getItem(AJUSTES) ?? 'null');
    if (!crudo || typeof crudo !== 'object') return AJUSTES_POR_DEFECTO;
    const a = crudo as Partial<Record<keyof AjustesEnPersona, unknown>>;
    return {
      impostores: typeof a.impostores === 'number' && a.impostores >= 1 && a.impostores <= 3 ? Math.floor(a.impostores) : 1,
      pista: typeof a.pista === 'boolean' ? a.pista : true,
    };
  } catch {
    return AJUSTES_POR_DEFECTO;
  }
}

export function guardarAjustes(ajustes: AjustesEnPersona) {
  try {
    localStorage.setItem(AJUSTES, JSON.stringify(ajustes));
  } catch {
    // Sin localStorage: la próxima vez arranca con los valores por defecto
  }
}
