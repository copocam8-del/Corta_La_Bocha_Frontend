// Hinchas de clubes: el mismo personaje (profile/Hincha.tsx) con los colores de la camiseta titular
// clásica de cada club. Diseño propio: SIN escudos, logos, sponsors ni nombres en el dibujo (el nombre
// del club se muestra sólo como texto debajo, en el selector).
//
// Los ids tienen que coincidir con CLUB_AVATAR_IDS del backend (src/users/avatars.ts), en el mismo
// orden (alfabético por nombre). Los tests de los dos repos lo controlan. NUNCA cambies un id: los
// usuarios ya lo pueden tener elegido.
// Para agregar un club: sumalo acá y su id en el backend (máximo 30 caracteres en total).

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
  club: string;
  diseno: DisenoCamiseta;
  camiseta: [string, string] | [string, string, string]; // principal, secundario (y tercero en rayas)
  short: string;
  medias: string;
  fondo: string; // color fuerte que contraste con la camiseta (nada de pasteles)
  liga: 'lpf' | 'historico' | 'exterior'; // Liga Profesional 2026, ascenso/históricos, del exterior
}

// Colores de camisetas: saturados e intensos (rojos bien rojos, azules profundos, verdes vivos)
const BLANCO = '#ffffff';
const NEGRO = '#111111';
const ROJO = '#e10600';
const AZUL = '#0033a0';
const AZUL_MARINO = '#071d5c';
const AMARILLO = '#ffd200';
const CELESTE = '#3fa9f5';
const CELESTE_CLARO = '#5ec8f2';
const VERDE = '#00a443';
const GRANATE = '#8c0f2a';

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
const LIMA = '#8cc800';

export const HINCHAS: Hincha[] = [
  { id: 'hincha_aldosivi', club: 'Aldosivi', diseno: 'rayas', camiseta: [VERDE, AMARILLO], short: VERDE, medias: VERDE, fondo: VIOLETA, liga: 'lpf' },
  { id: 'hincha_all_boys', club: 'All Boys', diseno: 'lisa', camiseta: [BLANCO, NEGRO], short: NEGRO, medias: BLANCO, fondo: ROJO_F, liga: 'historico' },
  { id: 'hincha_almagro', club: 'Almagro', diseno: 'rayas', camiseta: [AZUL, NEGRO], short: BLANCO, medias: NEGRO, fondo: AMARILLO_F, liga: 'historico' },
  { id: 'hincha_argentinos', club: 'Argentinos Juniors', diseno: 'lisa', camiseta: [ROJO, BLANCO], short: BLANCO, medias: ROJO, fondo: TURQUESA, liga: 'lpf' },
  { id: 'hincha_arsenal', club: 'Arsenal de Sarandí', diseno: 'banda', camiseta: [CELESTE_CLARO, ROJO], short: CELESTE_CLARO, medias: CELESTE_CLARO, fondo: NARANJA, liga: 'historico' },
  { id: 'hincha_atlanta', club: 'Atlanta', diseno: 'rayas', camiseta: [AZUL, AMARILLO], short: AZUL, medias: AZUL, fondo: MAGENTA, liga: 'historico' },
  { id: 'hincha_atl_tucuman', club: 'Atlético Tucumán', diseno: 'rayas', camiseta: [CELESTE, BLANCO], short: AZUL_MARINO, medias: CELESTE, fondo: CORAL, liga: 'lpf' },
  { id: 'hincha_banfield', club: 'Banfield', diseno: 'rayas', camiseta: [VERDE, BLANCO], short: BLANCO, medias: VERDE, fondo: MAGENTA, liga: 'lpf' },
  { id: 'hincha_barcelona', club: 'Barcelona', diseno: 'rayas', camiseta: ['#b0004e', '#0050b5'], short: '#0050b5', medias: '#0050b5', fondo: AMARILLO_F, liga: 'exterior' },
  { id: 'hincha_barracas', club: 'Barracas Central', diseno: 'rayas', camiseta: [ROJO, BLANCO], short: NEGRO, medias: NEGRO, fondo: AZUL_F, liga: 'lpf' },
  { id: 'hincha_belgrano', club: 'Belgrano', diseno: 'lisa', camiseta: ['#3fb4ff', AZUL_MARINO], short: AZUL_MARINO, medias: '#3fb4ff', fondo: ROSA, liga: 'lpf' },
  { id: 'hincha_boca', club: 'Boca Juniors', diseno: 'franja', camiseta: [AZUL, AMARILLO], short: AZUL, medias: AZUL, fondo: ROJO_F, liga: 'lpf' },
  { id: 'hincha_central_cordoba', club: 'Central Córdoba (SdE)', diseno: 'rayas', camiseta: [NEGRO, BLANCO], short: NEGRO, medias: NEGRO, fondo: AMARILLO_F, liga: 'lpf' },
  { id: 'hincha_chacarita', club: 'Chacarita Juniors', diseno: 'rayas', camiseta: [ROJO, BLANCO, NEGRO], short: NEGRO, medias: NEGRO, fondo: TURQUESA, liga: 'historico' },
  { id: 'hincha_colon', club: 'Colón', diseno: 'mitades', camiseta: [NEGRO, ROJO], short: NEGRO, medias: NEGRO, fondo: LIMA, liga: 'historico' },
  { id: 'hincha_defensa', club: 'Defensa y Justicia', diseno: 'lisa', camiseta: [AMARILLO, VERDE], short: VERDE, medias: AMARILLO, fondo: VIOLETA, liga: 'lpf' },
  { id: 'hincha_riestra', club: 'Deportivo Riestra', diseno: 'lisa', camiseta: [NEGRO, BLANCO], short: NEGRO, medias: NEGRO, fondo: MAGENTA, liga: 'lpf' },
  { id: 'hincha_estudiantes_lp', club: 'Estudiantes (La Plata)', diseno: 'rayas', camiseta: [ROJO, BLANCO], short: NEGRO, medias: ROJO, fondo: AZUL_F, liga: 'lpf' },
  { id: 'hincha_estudiantes_rc', club: 'Estudiantes (Río Cuarto)', diseno: 'rayas', camiseta: [CELESTE, BLANCO], short: NEGRO, medias: BLANCO, fondo: VIOLETA, liga: 'lpf' },
  { id: 'hincha_ferro', club: 'Ferro Carril Oeste', diseno: 'lisa', camiseta: ['#007a33', BLANCO], short: BLANCO, medias: '#007a33', fondo: NARANJA, liga: 'historico' },
  { id: 'hincha_gimnasia_lp', club: 'Gimnasia (La Plata)', diseno: 'franja', camiseta: [BLANCO, AZUL_MARINO], short: BLANCO, medias: BLANCO, fondo: AMARILLO_F, liga: 'lpf' },
  { id: 'hincha_gimnasia_mza', club: 'Gimnasia (Mendoza)', diseno: 'rayas', camiseta: [NEGRO, BLANCO], short: NEGRO, medias: BLANCO, fondo: TURQUESA, liga: 'lpf' },
  { id: 'hincha_godoy_cruz', club: 'Godoy Cruz', diseno: 'rayas', camiseta: ['#0047bb', BLANCO], short: '#0047bb', medias: '#0047bb', fondo: NARANJA, liga: 'historico' },
  { id: 'hincha_huracan', club: 'Huracán', diseno: 'lisa', camiseta: [BLANCO, ROJO], short: BLANCO, medias: BLANCO, fondo: PETROLEO, liga: 'lpf' },
  { id: 'hincha_independiente', club: 'Independiente', diseno: 'lisa', camiseta: [ROJO, BLANCO], short: AZUL_MARINO, medias: ROJO, fondo: PETROLEO, liga: 'lpf' },
  { id: 'hincha_ind_rivadavia', club: 'Independiente Rivadavia', diseno: 'lisa', camiseta: [AZUL, BLANCO], short: AZUL, medias: AZUL, fondo: AMARILLO_F, liga: 'lpf' },
  { id: 'hincha_instituto', club: 'Instituto', diseno: 'rayas', camiseta: [ROJO, BLANCO], short: BLANCO, medias: ROJO, fondo: VIOLETA, liga: 'lpf' },
  { id: 'hincha_lanus', club: 'Lanús', diseno: 'lisa', camiseta: [GRANATE, BLANCO], short: GRANATE, medias: GRANATE, fondo: TURQUESA, liga: 'lpf' },
  { id: 'hincha_newells', club: "Newell's Old Boys", diseno: 'mitades', camiseta: [ROJO, NEGRO], short: NEGRO, medias: ROJO, fondo: AMARILLO_F, liga: 'lpf' },
  { id: 'hincha_nueva_chicago', club: 'Nueva Chicago', diseno: 'rayas', camiseta: [VERDE, NEGRO], short: NEGRO, medias: VERDE, fondo: NARANJA, liga: 'historico' },
  { id: 'hincha_olimpo', club: 'Olimpo', diseno: 'rayas', camiseta: [AMARILLO, NEGRO], short: NEGRO, medias: AMARILLO, fondo: AZUL_F, liga: 'historico' },
  { id: 'hincha_platense', club: 'Platense', diseno: 'franja', camiseta: [BLANCO, '#7b3f00'], short: NEGRO, medias: BLANCO, fondo: TURQUESA, liga: 'lpf' },
  { id: 'hincha_quilmes', club: 'Quilmes', diseno: 'lisa', camiseta: [BLANCO, AZUL_MARINO], short: AZUL_MARINO, medias: BLANCO, fondo: ROJO_F, liga: 'historico' },
  { id: 'hincha_racing', club: 'Racing Club', diseno: 'rayas', camiseta: [CELESTE, BLANCO], short: NEGRO, medias: CELESTE, fondo: MAGENTA, liga: 'lpf' },
  { id: 'hincha_real_madrid', club: 'Real Madrid', diseno: 'lisa', camiseta: [BLANCO, '#e0b000'], short: BLANCO, medias: BLANCO, fondo: VIOLETA, liga: 'exterior' },
  { id: 'hincha_river', club: 'River Plate', diseno: 'banda', camiseta: [BLANCO, ROJO], short: NEGRO, medias: BLANCO, fondo: AZUL_F, liga: 'lpf' },
  { id: 'hincha_rosario_central', club: 'Rosario Central', diseno: 'rayas', camiseta: [AZUL, AMARILLO], short: AZUL, medias: AMARILLO, fondo: CORAL, liga: 'lpf' },
  { id: 'hincha_san_lorenzo', club: 'San Lorenzo', diseno: 'rayas', camiseta: [AZUL, ROJO], short: AZUL, medias: AZUL, fondo: AMARILLO_F, liga: 'lpf' },
  { id: 'hincha_san_martin_sj', club: 'San Martín (San Juan)', diseno: 'rayas', camiseta: [VERDE, NEGRO], short: NEGRO, medias: NEGRO, fondo: ROSA, liga: 'historico' },
  { id: 'hincha_sarmiento', club: 'Sarmiento (Junín)', diseno: 'lisa', camiseta: ['#00b140', BLANCO], short: BLANCO, medias: '#00b140', fondo: VIOLETA, liga: 'lpf' },
  { id: 'hincha_talleres', club: 'Talleres (Córdoba)', diseno: 'rayas', camiseta: [AZUL_MARINO, BLANCO], short: AZUL_MARINO, medias: AZUL_MARINO, fondo: NARANJA, liga: 'lpf' },
  { id: 'hincha_temperley', club: 'Temperley', diseno: 'lisa', camiseta: [CELESTE_CLARO, BLANCO], short: BLANCO, medias: CELESTE_CLARO, fondo: ROJO_F, liga: 'historico' },
  { id: 'hincha_tigre', club: 'Tigre', diseno: 'franja', camiseta: [AZUL_MARINO, ROJO], short: AZUL_MARINO, medias: AZUL_MARINO, fondo: AMARILLO_F, liga: 'lpf' },
  { id: 'hincha_union', club: 'Unión (Santa Fe)', diseno: 'rayas', camiseta: [ROJO, BLANCO], short: NEGRO, medias: BLANCO, fondo: AZUL_F, liga: 'lpf' },
  { id: 'hincha_velez', club: 'Vélez Sarsfield', diseno: 'v', camiseta: [BLANCO, AZUL], short: AZUL, medias: BLANCO, fondo: CORAL, liga: 'lpf' },
];

export const getHincha = (id: string | null | undefined) => HINCHAS.find((h) => h.id === id);

// Variantes del personaje según el id: siempre las mismas para el mismo club, pero no todos iguales.
// Si agregás un club no cambian los demás.
//   pose: 0 mano en la cintura y vaso, 1 señalando, 2 "aguante" con el puño, 3 vaso a la altura del pecho
//   cara: 0 canchero, 1 gritando, 2 guiño
//   piel: 4 tonos · pelo: 0 rulos, 1 largo, 2 rapado a los costados, 3 flequillo · colorPelo: 4
//   vello: 0 nada, 1 barba, 2 bigote · accesorio: 0 nada, 1 cadenita, 2 muñequera con los colores del club
export function varianteDe(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const tomar = (n: number) => {
    const r = h % n;
    h = Math.floor(h / n);
    return r;
  };
  return { pose: tomar(4), cara: tomar(3), piel: tomar(4), pelo: tomar(4), colorPelo: tomar(4), vello: tomar(3), accesorio: tomar(3) };
}

// Orden alfabético en español (sin importar tildes ni mayúsculas) y búsqueda del selector
export const ordenarPorClub = (lista: Hincha[]) => [...lista].sort((a, b) => a.club.localeCompare(b.club, 'es', { sensitivity: 'base' }));

const sinTildes = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
export const buscarHinchas = (texto: string, lista: Hincha[] = HINCHAS) => {
  const q = sinTildes(texto.trim());
  return q ? lista.filter((h) => sinTildes(h.club).includes(q)) : lista;
};
