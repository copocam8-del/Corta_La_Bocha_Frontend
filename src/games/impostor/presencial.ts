import type { PalabraEnPersona } from '../../api/impostor';

// El Impostor "En persona" (un solo celular que se pasan): reglas que corren en el navegador.
// Las palabras las da el backend (POST /impostor/local); el impostor, quién empieza y todo lo demás
// se decide acá. Sin pantallas ni red: se prueba en impostorPresencial.test.ts.

export const MIN_JUGADORES = 3;
export const MAX_JUGADORES = 12;
export const NOMBRE_MAX = 20;
export const VUELTAS = 2; // vueltas de pistas en voz alta
const GUARDADOS = 'impostor-en-persona-nombres';

export interface RondaEnPersona {
  numero: number;
  palabra: string;
  categoria: string;
  impostor: number; // índice en la lista de jugadores
  empieza: number; // quién da la primera pista
}

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

// Todas las rondas de la partida (una por palabra): impostor rotando y quién empieza al azar
export function armarRondas(cantidadJugadores: number, palabras: PalabraEnPersona[], azar: () => number = Math.random): RondaEnPersona[] {
  const veces = Array.from({ length: cantidadJugadores }, () => 0);
  return palabras.map((p, i) => {
    const impostor = elegirImpostor(veces, azar);
    veces[impostor] += 1;
    return { numero: i + 1, palabra: p.texto, categoria: p.categoria, impostor, empieza: Math.floor(azar() * cantidadJugadores) };
  });
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
