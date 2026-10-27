// Selección de la sopa de letras: mientras el jugador arrastra (mouse o dedo), la línea se "pega"
// a la dirección recta más cercana (horizontal, vertical o diagonal).

export interface Celda {
  f: number;
  c: number;
}

export function lineaRecta(desde: Celda, cursor: Celda, tamano: number): Celda {
  const df = cursor.f - desde.f;
  const dc = cursor.c - desde.c;
  if (df === 0 && dc === 0) return desde;
  // Ángulo redondeado a múltiplos de 45°
  const angulo = Math.round(Math.atan2(df, dc) / (Math.PI / 4)) * (Math.PI / 4);
  const pasoF = Math.round(Math.sin(angulo));
  const pasoC = Math.round(Math.cos(angulo));
  let largo = Math.max(Math.abs(df), Math.abs(dc));
  // Que no se salga de la grilla
  while (largo > 0) {
    const f = desde.f + pasoF * largo;
    const c = desde.c + pasoC * largo;
    if (f >= 0 && f < tamano && c >= 0 && c < tamano) break;
    largo -= 1;
  }
  return { f: desde.f + pasoF * largo, c: desde.c + pasoC * largo };
}

export function celdasEntre(desde: Celda, hasta: Celda): Celda[] {
  const pasoF = Math.sign(hasta.f - desde.f);
  const pasoC = Math.sign(hasta.c - desde.c);
  const n = Math.max(Math.abs(hasta.f - desde.f), Math.abs(hasta.c - desde.c)) + 1;
  return Array.from({ length: n }, (_, i) => ({ f: desde.f + pasoF * i, c: desde.c + pasoC * i }));
}

// Medidas de la grilla en pantalla (solo y multijugador): en la compu llega a SOPA_ANCHO px (más ancha que la columna
// de 480, .ui-ancho); en el celular ocupa el ancho de la columna. La letra crece con la celda (--n = letras por fila).
export const SOPA_ANCHO = 600;
export const SOPA_LETRA = 'clamp(12px, calc(min(var(--ancho), 100vw - 40px) / var(--n) * 0.48), 22px)';
