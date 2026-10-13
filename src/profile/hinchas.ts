// Hinchas de clubes: el mismo personaje (profile/Hincha.tsx) con los colores de la camiseta titular
// clásica de cada club. Diseño propio: SIN escudos, logos, sponsors ni nombres en el dibujo (el nombre
// del club se muestra sólo como texto debajo, en el selector).
//
// UN avatar por camiseta: si varios clubes tienen la misma (mismo diseño y mismos colores, aunque
// cambie el fondo), queda uno solo con el club más conocido como nombre principal (club) y los demás
// en "otros": se muestran debajo en el selector y el buscador los encuentra por cualquier nombre.
//
// Los ids tienen que coincidir con CLUB_AVATAR_IDS del backend (src/users/avatars.ts), en el mismo
// orden (alfabético por el nombre principal). Los tests de los dos repos lo controlan.
// Para agregar un club: si su camiseta ya está, sumalo a "otros" de ese avatar (no hace falta id
// nuevo); si no, agregá un avatar acá y su id en el backend (máximo 30 caracteres en total).

// Diseño de la camiseta:
//   lisa    → un color (el secundario va en el cuello)
//   rayas   → bastones verticales (con 3 colores alterna los 3)
//   aros    → franjas horizontales en toda la camiseta
//   franja  → una sola franja horizontal en el pecho (ej. Boca)
//   banda   → banda diagonal de hombro a cintura (ej. River)
//   mitades → mitad izquierda de un color y mitad derecha de otro
//   v       → una V en el pecho (ej. Vélez)
export type DisenoCamiseta = 'lisa' | 'rayas' | 'aros' | 'franja' | 'banda' | 'mitades' | 'v';

export interface Hincha {
  id: string;
  club: string; // el más conocido con esta camiseta
  otros?: string[]; // otros clubes con la misma camiseta
  diseno: DisenoCamiseta;
  camiseta: [string, string] | [string, string, string]; // principal, secundario (y tercero en rayas)
  short: string;
  medias: string;
  fondo: string; // color fuerte que contraste con la camiseta (nada de pasteles)
  liga: 'lpf' | 'historico' | 'exterior'; // del club principal: Liga Profesional 2026, ascenso/históricos, exterior
}

// Colores de camisetas: saturados e intensos
const BLANCO = '#ffffff';
const NEGRO = '#111111';
const ROJO = '#e10600';
const AZUL = '#0033a0';
const AZUL_MARINO = '#071d5c';
const AMARILLO = '#ffd200';
const CELESTE = '#3fa9f5';
const VERDE = '#00a443';
const GRANATE = '#8c0f2a';
const VIOLETA_LEPRA = '#5b2a9e'; // Independiente Rivadavia

// Fondos fuertes
const NARANJA = '#ff7a00';
const VIOLETA = '#7b2cbf';
const MAGENTA = '#e0218a';
const TURQUESA = '#00b3a6';
const AMARILLO_F = '#ffc300';
const AZUL_F = '#1e6bff';
const ROJO_F = '#e63946';
const ROSA = '#ff4d8d';
const PETROLEO = '#00798c';
const CORAL = '#ff5e3a';

export const HINCHAS: Hincha[] = [
  { id: 'hincha_aldosivi', club: 'Aldosivi', diseno: 'rayas', camiseta: [VERDE, AMARILLO], short: VERDE, medias: VERDE, fondo: VIOLETA, liga: 'lpf' },
  { id: 'hincha_almagro', club: 'Almagro', diseno: 'rayas', camiseta: [AZUL, NEGRO], short: BLANCO, medias: NEGRO, fondo: AMARILLO_F, liga: 'historico' },
  { id: 'hincha_arsenal', club: 'Arsenal de Sarandí', diseno: 'banda', camiseta: ['#5ec8f2', ROJO], short: '#5ec8f2', medias: '#5ec8f2', fondo: NARANJA, liga: 'historico' },
  { id: 'hincha_banfield', club: 'Banfield', diseno: 'rayas', camiseta: [VERDE, BLANCO], short: BLANCO, medias: VERDE, fondo: MAGENTA, liga: 'lpf' },
  { id: 'hincha_barcelona', club: 'Barcelona', diseno: 'rayas', camiseta: ['#b0004e', '#0050b5'], short: '#0050b5', medias: '#0050b5', fondo: AMARILLO_F, liga: 'exterior' },
  { id: 'hincha_belgrano', club: 'Belgrano', otros: ['Temperley'], diseno: 'lisa', camiseta: ['#3fb4ff', AZUL_MARINO], short: AZUL_MARINO, medias: '#3fb4ff', fondo: ROSA, liga: 'lpf' },
  { id: 'hincha_boca', club: 'Boca Juniors', diseno: 'franja', camiseta: [AZUL, AMARILLO], short: AZUL, medias: AZUL, fondo: ROJO_F, liga: 'lpf' },
  { id: 'hincha_central_cordoba', club: 'Central Córdoba (SdE)', otros: ['Gimnasia (Mendoza)'], diseno: 'rayas', camiseta: [NEGRO, BLANCO], short: NEGRO, medias: NEGRO, fondo: AMARILLO_F, liga: 'lpf' },
  { id: 'hincha_chacarita', club: 'Chacarita Juniors', diseno: 'rayas', camiseta: [ROJO, BLANCO, NEGRO], short: NEGRO, medias: NEGRO, fondo: TURQUESA, liga: 'historico' },
  { id: 'hincha_defensa', club: 'Defensa y Justicia', diseno: 'lisa', camiseta: [AMARILLO, VERDE], short: VERDE, medias: AMARILLO, fondo: VIOLETA, liga: 'lpf' },
  { id: 'hincha_riestra', club: 'Deportivo Riestra', diseno: 'lisa', camiseta: [NEGRO, BLANCO], short: NEGRO, medias: NEGRO, fondo: MAGENTA, liga: 'lpf' },
  { id: 'hincha_estudiantes_lp', club: 'Estudiantes (La Plata)', otros: ['Instituto', 'Unión (Santa Fe)', 'Barracas Central'], diseno: 'rayas', camiseta: [ROJO, BLANCO], short: NEGRO, medias: ROJO, fondo: AZUL_F, liga: 'lpf' },
  { id: 'hincha_ferro', club: 'Ferro Carril Oeste', otros: ['Sarmiento (Junín)'], diseno: 'lisa', camiseta: ['#007a33', BLANCO], short: BLANCO, medias: '#007a33', fondo: NARANJA, liga: 'historico' },
  { id: 'hincha_gimnasia_lp', club: 'Gimnasia (La Plata)', diseno: 'franja', camiseta: [BLANCO, AZUL_MARINO], short: BLANCO, medias: BLANCO, fondo: AMARILLO_F, liga: 'lpf' },
  { id: 'hincha_independiente', club: 'Independiente', otros: ['Argentinos Juniors'], diseno: 'lisa', camiseta: [ROJO, BLANCO], short: AZUL_MARINO, medias: ROJO, fondo: PETROLEO, liga: 'lpf' },
  { id: 'hincha_ind_rivadavia', club: 'Independiente Rivadavia', diseno: 'lisa', camiseta: [VIOLETA_LEPRA, BLANCO], short: VIOLETA_LEPRA, medias: VIOLETA_LEPRA, fondo: AMARILLO_F, liga: 'lpf' },
  { id: 'hincha_lanus', club: 'Lanús', diseno: 'lisa', camiseta: [GRANATE, BLANCO], short: GRANATE, medias: GRANATE, fondo: TURQUESA, liga: 'lpf' },
  { id: 'hincha_newells', club: "Newell's Old Boys", otros: ['Colón'], diseno: 'mitades', camiseta: [ROJO, NEGRO], short: NEGRO, medias: ROJO, fondo: AMARILLO_F, liga: 'lpf' },
  { id: 'hincha_nueva_chicago', club: 'Nueva Chicago', otros: ['San Martín (San Juan)'], diseno: 'rayas', camiseta: [VERDE, NEGRO], short: NEGRO, medias: VERDE, fondo: NARANJA, liga: 'historico' },
  { id: 'hincha_olimpo', club: 'Olimpo', diseno: 'rayas', camiseta: [AMARILLO, NEGRO], short: NEGRO, medias: AMARILLO, fondo: AZUL_F, liga: 'historico' },
  { id: 'hincha_platense', club: 'Platense', diseno: 'franja', camiseta: [BLANCO, '#7b3f00'], short: NEGRO, medias: BLANCO, fondo: TURQUESA, liga: 'lpf' },
  { id: 'hincha_racing', club: 'Racing Club', otros: ['Atlético Tucumán', 'Estudiantes (Río Cuarto)'], diseno: 'rayas', camiseta: [CELESTE, BLANCO], short: NEGRO, medias: CELESTE, fondo: MAGENTA, liga: 'lpf' },
  { id: 'hincha_real_madrid', club: 'Real Madrid', otros: ['Huracán', 'Quilmes', 'All Boys'], diseno: 'lisa', camiseta: [BLANCO, '#e0b000'], short: BLANCO, medias: BLANCO, fondo: VIOLETA, liga: 'exterior' },
  { id: 'hincha_river', club: 'River Plate', diseno: 'banda', camiseta: [BLANCO, ROJO], short: NEGRO, medias: BLANCO, fondo: AZUL_F, liga: 'lpf' },
  { id: 'hincha_rosario_central', club: 'Rosario Central', otros: ['Atlanta'], diseno: 'rayas', camiseta: [AZUL, AMARILLO], short: AZUL, medias: AMARILLO, fondo: CORAL, liga: 'lpf' },
  { id: 'hincha_san_lorenzo', club: 'San Lorenzo', diseno: 'rayas', camiseta: [AZUL, ROJO], short: AZUL, medias: AZUL, fondo: AMARILLO_F, liga: 'lpf' },
  { id: 'hincha_talleres', club: 'Talleres (Córdoba)', otros: ['Godoy Cruz'], diseno: 'rayas', camiseta: [AZUL_MARINO, BLANCO], short: AZUL_MARINO, medias: AZUL_MARINO, fondo: NARANJA, liga: 'lpf' },
  { id: 'hincha_tigre', club: 'Tigre', diseno: 'franja', camiseta: [AZUL_MARINO, ROJO], short: AZUL_MARINO, medias: AZUL_MARINO, fondo: AMARILLO_F, liga: 'lpf' },
  { id: 'hincha_velez', club: 'Vélez Sarsfield', diseno: 'v', camiseta: [BLANCO, AZUL], short: AZUL, medias: BLANCO, fondo: CORAL, liga: 'lpf' },
];

// Cada hincha tiene dos poses: la 1 (con el mate) usa el id del club y la 2 (festejando con los brazos arriba)
// el mismo id + "_2". Los dos ids están en el backend (CLUB_AVATAR_IDS y CLUB_AVATAR_IDS_2).
export type PoseHincha = 1 | 2;
export const POSES_HINCHA: PoseHincha[] = [1, 2];
export const avatarIdDe = (h: Hincha, pose: PoseHincha) => (pose === 1 ? h.id : `${h.id}_2`);
export const HINCHA_AVATAR_IDS = HINCHAS.flatMap((h) => POSES_HINCHA.map((p) => avatarIdDe(h, p)));
export const poseDe = (id: string): PoseHincha => (id.endsWith('_2') ? 2 : 1);

// Sirve con los dos ids (pose 1 o 2): devuelve el club
export const getHincha = (id: string | null | undefined) => {
  if (!id) return undefined;
  return HINCHAS.find((h) => h.id === id || `${h.id}_2` === id);
};

// Todos los clubes de un avatar: el principal y los que tienen la misma camiseta
export const nombresDe = (h: Hincha) => [h.club, ...(h.otros ?? [])];

// Variantes del personaje según el id: siempre las mismas para el mismo club, pero no todos iguales.
// Si agregás un club no cambian los demás.
//   pose: 6 (vaso a la altura del pecho o abajo × señalando, pulgar arriba o mano en la cintura)
//   espejo: el vaso en la otra mano · cara: 0 sonrisa enorme, 1 carcajada, 2 canchero (ceja levantada)
//   piel: 4 tonos · pelo: 0 largo con flequillo, 1 desprolijo, 2 largo con raya al medio, 3 melena con rulos
//   colorPelo: 4 · vello: 0 nada, 1 bigote finito, 2 barba de pocos días
//   accesorio: 0 nada, 1 cadenita, 2 muñequera con los colores del club
// Mezcla los bits (como el final de MurmurHash3): todos los ids empiezan con "hincha_" y sin esto
// las variantes salían muy desparejas
const mezclar = (x: number) => {
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b);
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
  return (x ^ (x >>> 16)) >>> 0;
};

export function varianteDe(id: string) {
  let h = 0;
  for (const c of id) h = (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0;
  let paso = 0;
  // Cada variante sale de una mezcla distinta del mismo número
  const tomar = (n: number) => mezclar(h + Math.imul(++paso, 0x9e3779b9)) % n;
  return {
    pose: tomar(6), espejo: tomar(2) === 1, cara: tomar(3), piel: tomar(4), pelo: tomar(4),
    colorPelo: tomar(4), vello: tomar(3), accesorio: tomar(3),
  };
}

// Orden alfabético en español (sin importar tildes ni mayúsculas) y búsqueda del selector
export const ordenarPorClub = (lista: Hincha[]) => [...lista].sort((a, b) => a.club.localeCompare(b.club, 'es', { sensitivity: 'base' }));

const sinTildes = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
// Busca por el club principal y por los otros clubes con la misma camiseta
export const buscarHinchas = (texto: string, lista: Hincha[] = HINCHAS) => {
  const q = sinTildes(texto.trim());
  return q ? lista.filter((h) => nombresDe(h).some((n) => sinTildes(n).includes(q))) : lista;
};
