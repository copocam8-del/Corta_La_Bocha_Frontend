// Formatos y colores del panel de administración (separado de los componentes por Fast Refresh)

export const VERDE = '#39ff8c';
export const TENUE = 'rgba(180,255,205,0.6)';

// Un color por juego (gráfico apilado y leyenda)
export const COLOR_JUEGO: Record<string, string> = {
  tutti_frutti: '#39ff8c',
  ahorcado: '#fbbf24',
  trivia: '#60a5fa',
  trivia_diaria: '#a78bfa',
  sopa_de_letras: '#f472b6',
  memotest: '#22d3ee',
};
export const colorJuego = (id: string) => COLOR_JUEGO[id] ?? '#fb923c';

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
// "2026-10-13" → "13 oct"
export function etiquetaDia(dia: string): string {
  const [, m, d] = dia.split('-').map(Number);
  return `${d} ${MESES[m - 1] ?? ''}`;
}

export const numero = (n: number) => n.toLocaleString('es-AR');
// Plata con dos decimales y coma: "0,37"
export const plata = (n: number) => n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
