// Hinchas de clubes: el mismo personaje (profile/Hincha.tsx) con los colores de la camiseta titular
// clásica de cada club. Diseño propio: SIN escudos, logos, sponsors ni nombres en el dibujo (el nombre
// del club se muestra sólo como texto debajo, en el selector).
//
// Los ids tienen que coincidir con CLUB_AVATAR_IDS del backend (src/users/avatars.ts), en el mismo
// orden (alfabético por nombre). Los tests de los dos repos lo controlan.
// Para agregar un club: sumalo acá y su id en el backend (máximo 30 caracteres en total).

// Diseño de la camiseta:
//   lisa    → un color (el secundario va en el cuello y las mangas)
//   rayas   → bastones verticales (con 3 colores alterna los 3)
//   aros    → franjas horizontales en toda la camiseta
//   franja  → una sola franja horizontal en el pecho (ej. Boca)
//   banda   → banda diagonal de hombro a cintura (ej. River)
//   mitades → mitad izquierda de un color y mitad derecha de otro
//   v       → una V en el pecho (ej. Vélez)
export type DisenoCamiseta = 'lisa' | 'rayas' | 'aros' | 'franja' | 'banda' | 'mitades' | 'v';

export interface Hincha {
  id: string;
  club: string;
  diseno: DisenoCamiseta;
  camiseta: [string, string] | [string, string, string]; // principal, secundario (y tercero en rayas)
  short: string;
  medias: string;
  piluso: string;
  fondo: string;
  liga: 'lpf' | 'historico' | 'exterior'; // Liga Profesional 2026, ascenso/históricos, del exterior
}

// Colores base (para no repetir el mismo rojo o blanco con tonos distintos)
const BLANCO = '#f5f5f0';
const NEGRO = '#1c1c1e';
const ROJO = '#d0202e';
const AZUL = '#1d3f8f';
const AZUL_MARINO = '#13285c';
const AMARILLO = '#f6c90e';
const CELESTE = '#6cb4e4';
const VERDE = '#0e7a3c';

export const HINCHAS: Hincha[] = [
  { id: 'hincha_aldosivi', club: 'Aldosivi', diseno: 'rayas', camiseta: [VERDE, '#f7d117'], short: VERDE, medias: VERDE, piluso: '#f7d117', fondo: '#bfe6c9', liga: 'lpf' },
  { id: 'hincha_all_boys', club: 'All Boys', diseno: 'lisa', camiseta: [BLANCO, NEGRO], short: NEGRO, medias: BLANCO, piluso: NEGRO, fondo: '#9fb3c8', liga: 'historico' },
  { id: 'hincha_almagro', club: 'Almagro', diseno: 'rayas', camiseta: [AZUL, NEGRO], short: BLANCO, medias: NEGRO, piluso: AZUL, fondo: '#f2e1b3', liga: 'historico' },
  { id: 'hincha_argentinos', club: 'Argentinos Juniors', diseno: 'lisa', camiseta: [ROJO, BLANCO], short: BLANCO, medias: ROJO, piluso: ROJO, fondo: '#f6d2c4', liga: 'lpf' },
  { id: 'hincha_arsenal', club: 'Arsenal de Sarandí', diseno: 'banda', camiseta: ['#7cc3ea', ROJO], short: '#7cc3ea', medias: '#7cc3ea', piluso: ROJO, fondo: '#fde2c6', liga: 'historico' },
  { id: 'hincha_atlanta', club: 'Atlanta', diseno: 'rayas', camiseta: [AZUL, AMARILLO], short: AZUL, medias: AZUL, piluso: AMARILLO, fondo: '#d6e4ff', liga: 'historico' },
  { id: 'hincha_atl_tucuman', club: 'Atlético Tucumán', diseno: 'rayas', camiseta: [CELESTE, BLANCO], short: AZUL_MARINO, medias: CELESTE, piluso: AZUL_MARINO, fondo: '#f3dfa2', liga: 'lpf' },
  { id: 'hincha_banfield', club: 'Banfield', diseno: 'rayas', camiseta: ['#13804a', BLANCO], short: BLANCO, medias: '#13804a', piluso: '#13804a', fondo: '#f1e3c8', liga: 'lpf' },
  { id: 'hincha_barcelona', club: 'Barcelona', diseno: 'rayas', camiseta: ['#a50044', '#004d98'], short: '#004d98', medias: '#004d98', piluso: '#edbb00', fondo: '#f9e7b0', liga: 'exterior' },
  { id: 'hincha_barracas', club: 'Barracas Central', diseno: 'rayas', camiseta: [ROJO, BLANCO], short: NEGRO, medias: NEGRO, piluso: ROJO, fondo: '#cfd8dc', liga: 'lpf' },
  { id: 'hincha_belgrano', club: 'Belgrano', diseno: 'lisa', camiseta: ['#62b5e5', AZUL_MARINO], short: AZUL_MARINO, medias: '#62b5e5', piluso: AZUL_MARINO, fondo: '#fff1c4', liga: 'lpf' },
  { id: 'hincha_boca', club: 'Boca Juniors', diseno: 'franja', camiseta: ['#0b2a6f', AMARILLO], short: '#0b2a6f', medias: '#0b2a6f', piluso: AMARILLO, fondo: '#a9c6f0', liga: 'lpf' },
  { id: 'hincha_central_cordoba', club: 'Central Córdoba (SdE)', diseno: 'rayas', camiseta: [NEGRO, BLANCO], short: NEGRO, medias: NEGRO, piluso: BLANCO, fondo: '#f4c7a1', liga: 'lpf' },
  { id: 'hincha_chacarita', club: 'Chacarita Juniors', diseno: 'rayas', camiseta: [ROJO, BLANCO, NEGRO], short: NEGRO, medias: NEGRO, piluso: ROJO, fondo: '#e9e2d0', liga: 'historico' },
  { id: 'hincha_colon', club: 'Colón', diseno: 'mitades', camiseta: [NEGRO, ROJO], short: NEGRO, medias: NEGRO, piluso: ROJO, fondo: '#ffd9a8', liga: 'historico' },
  { id: 'hincha_defensa', club: 'Defensa y Justicia', diseno: 'lisa', camiseta: ['#f6d500', '#0d7a3b'], short: '#0d7a3b', medias: '#f6d500', piluso: '#0d7a3b', fondo: '#c9ecd7', liga: 'lpf' },
  { id: 'hincha_riestra', club: 'Deportivo Riestra', diseno: 'lisa', camiseta: [NEGRO, BLANCO], short: NEGRO, medias: NEGRO, piluso: BLANCO, fondo: '#d4d4d8', liga: 'lpf' },
  { id: 'hincha_estudiantes_lp', club: 'Estudiantes (La Plata)', diseno: 'rayas', camiseta: [ROJO, BLANCO], short: NEGRO, medias: ROJO, piluso: ROJO, fondo: '#fbe3e3', liga: 'lpf' },
  { id: 'hincha_estudiantes_rc', club: 'Estudiantes (Río Cuarto)', diseno: 'rayas', camiseta: [CELESTE, BLANCO], short: NEGRO, medias: BLANCO, piluso: CELESTE, fondo: '#e6d3f5', liga: 'lpf' },
  { id: 'hincha_ferro', club: 'Ferro Carril Oeste', diseno: 'lisa', camiseta: ['#0b5e2e', BLANCO], short: BLANCO, medias: '#0b5e2e', piluso: BLANCO, fondo: '#f4e2b8', liga: 'historico' },
  { id: 'hincha_gimnasia_lp', club: 'Gimnasia (La Plata)', diseno: 'franja', camiseta: [BLANCO, AZUL_MARINO], short: BLANCO, medias: BLANCO, piluso: AZUL_MARINO, fondo: '#b8d0ef', liga: 'lpf' },
  { id: 'hincha_gimnasia_mza', club: 'Gimnasia (Mendoza)', diseno: 'rayas', camiseta: [NEGRO, BLANCO], short: NEGRO, medias: BLANCO, piluso: NEGRO, fondo: '#cde6f7', liga: 'lpf' },
  { id: 'hincha_godoy_cruz', club: 'Godoy Cruz', diseno: 'rayas', camiseta: ['#1f4fa3', BLANCO], short: '#1f4fa3', medias: '#1f4fa3', piluso: BLANCO, fondo: '#f7e6b5', liga: 'historico' },
  { id: 'hincha_huracan', club: 'Huracán', diseno: 'lisa', camiseta: [BLANCO, ROJO], short: BLANCO, medias: BLANCO, piluso: ROJO, fondo: '#f6c9cd', liga: 'lpf' },
  { id: 'hincha_independiente', club: 'Independiente', diseno: 'lisa', camiseta: [ROJO, BLANCO], short: AZUL_MARINO, medias: ROJO, piluso: BLANCO, fondo: '#f8d9b0', liga: 'lpf' },
  { id: 'hincha_ind_rivadavia', club: 'Independiente Rivadavia', diseno: 'lisa', camiseta: [AZUL, BLANCO], short: AZUL, medias: AZUL, piluso: BLANCO, fondo: '#ffe08a', liga: 'lpf' },
  { id: 'hincha_instituto', club: 'Instituto', diseno: 'rayas', camiseta: [ROJO, BLANCO], short: BLANCO, medias: ROJO, piluso: BLANCO, fondo: '#c6dbef', liga: 'lpf' },
  { id: 'hincha_lanus', club: 'Lanús', diseno: 'lisa', camiseta: ['#7a1e2c', BLANCO], short: '#7a1e2c', medias: '#7a1e2c', piluso: BLANCO, fondo: '#f3d6a3', liga: 'lpf' },
  { id: 'hincha_newells', club: "Newell's Old Boys", diseno: 'mitades', camiseta: [ROJO, NEGRO], short: NEGRO, medias: ROJO, piluso: NEGRO, fondo: '#f9e4a8', liga: 'lpf' },
  { id: 'hincha_nueva_chicago', club: 'Nueva Chicago', diseno: 'rayas', camiseta: [VERDE, NEGRO], short: NEGRO, medias: VERDE, piluso: VERDE, fondo: '#e5e7c8', liga: 'historico' },
  { id: 'hincha_olimpo', club: 'Olimpo', diseno: 'rayas', camiseta: [AMARILLO, NEGRO], short: NEGRO, medias: AMARILLO, piluso: NEGRO, fondo: '#c7d2fe', liga: 'historico' },
  { id: 'hincha_platense', club: 'Platense', diseno: 'franja', camiseta: [BLANCO, '#6b3f1f'], short: NEGRO, medias: BLANCO, piluso: '#6b3f1f', fondo: '#d9ecc5', liga: 'lpf' },
  { id: 'hincha_quilmes', club: 'Quilmes', diseno: 'lisa', camiseta: [BLANCO, AZUL_MARINO], short: AZUL_MARINO, medias: BLANCO, piluso: AZUL_MARINO, fondo: '#c5e3f6', liga: 'historico' },
  { id: 'hincha_racing', club: 'Racing Club', diseno: 'rayas', camiseta: [CELESTE, BLANCO], short: NEGRO, medias: CELESTE, piluso: CELESTE, fondo: '#283c63', liga: 'lpf' },
  { id: 'hincha_real_madrid', club: 'Real Madrid', diseno: 'lisa', camiseta: ['#f7f7f2', '#c9a227'], short: '#f7f7f2', medias: '#f7f7f2', piluso: '#c9a227', fondo: '#5b3fa0', liga: 'exterior' },
  { id: 'hincha_river', club: 'River Plate', diseno: 'banda', camiseta: [BLANCO, ROJO], short: NEGRO, medias: BLANCO, piluso: ROJO, fondo: '#3b3f48', liga: 'lpf' },
  { id: 'hincha_rosario_central', club: 'Rosario Central', diseno: 'rayas', camiseta: ['#13317a', AMARILLO], short: '#13317a', medias: AMARILLO, piluso: '#13317a', fondo: '#ffe9a6', liga: 'lpf' },
  { id: 'hincha_san_lorenzo', club: 'San Lorenzo', diseno: 'rayas', camiseta: [AZUL, '#c8102e'], short: AZUL, medias: AZUL, piluso: '#c8102e', fondo: '#f3e1c1', liga: 'lpf' },
  { id: 'hincha_san_martin_sj', club: 'San Martín (San Juan)', diseno: 'rayas', camiseta: [VERDE, NEGRO], short: NEGRO, medias: NEGRO, piluso: NEGRO, fondo: '#f4d8b5', liga: 'historico' },
  { id: 'hincha_sarmiento', club: 'Sarmiento (Junín)', diseno: 'lisa', camiseta: ['#13a04a', BLANCO], short: BLANCO, medias: '#13a04a', piluso: '#13a04a', fondo: '#e9d7f2', liga: 'lpf' },
  { id: 'hincha_talleres', club: 'Talleres (Córdoba)', diseno: 'rayas', camiseta: [AZUL_MARINO, BLANCO], short: AZUL_MARINO, medias: AZUL_MARINO, piluso: AZUL_MARINO, fondo: '#f7d9c4', liga: 'lpf' },
  { id: 'hincha_temperley', club: 'Temperley', diseno: 'lisa', camiseta: ['#7cc3ea', BLANCO], short: BLANCO, medias: '#7cc3ea', piluso: BLANCO, fondo: '#2c4a6e', liga: 'historico' },
  { id: 'hincha_tigre', club: 'Tigre', diseno: 'franja', camiseta: [AZUL_MARINO, ROJO], short: AZUL_MARINO, medias: AZUL_MARINO, piluso: ROJO, fondo: '#cfe3f7', liga: 'lpf' },
  { id: 'hincha_union', club: 'Unión (Santa Fe)', diseno: 'rayas', camiseta: [ROJO, BLANCO], short: NEGRO, medias: BLANCO, piluso: ROJO, fondo: '#bfe0d0', liga: 'lpf' },
  { id: 'hincha_velez', club: 'Vélez Sarsfield', diseno: 'v', camiseta: [BLANCO, AZUL], short: AZUL, medias: BLANCO, piluso: AZUL, fondo: '#c7ddf2', liga: 'lpf' },
];

export const getHincha = (id: string | null | undefined) => HINCHAS.find((h) => h.id === id);

// Variante de pose, cara y tono de piel según el id (siempre la misma para el mismo club, pero no
// todos iguales). Si agregás un club no cambian los demás.
export function varianteDe(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return { pose: h % 4, cara: Math.floor(h / 4) % 3, piel: Math.floor(h / 12) % 4 };
}

// Orden alfabético en español (sin importar tildes ni mayúsculas) y búsqueda del selector
export const ordenarPorClub = (lista: Hincha[]) => [...lista].sort((a, b) => a.club.localeCompare(b.club, 'es', { sensitivity: 'base' }));

const sinTildes = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
export const buscarHinchas = (texto: string, lista: Hincha[] = HINCHAS) => {
  const q = sinTildes(texto.trim());
  return q ? lista.filter((h) => sinTildes(h.club).includes(q)) : lista;
};
