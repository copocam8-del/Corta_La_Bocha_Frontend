// Textos y colores de cada estado de una respuesta (los estados los decide el backend)

export type AnswerStatus = 'valid' | 'invalid' | 'empty' | 'unverified';

export const STATUS_LABEL: Record<AnswerStatus, string> = {
  valid: 'Válida',
  invalid: 'No vale',
  empty: 'Sin respuesta',
  unverified: 'Sin validar',
};

export const STATUS_COLOR: Record<AnswerStatus, string> = {
  valid: '#39ff8c',
  invalid: '#f87171',
  empty: 'rgba(255,255,255,0.35)',
  unverified: '#fbbf24',
};

const normalize = (s: string | null | undefined) =>
  (s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

// Mostrar "La IA reconoció: Lionel Messi" sólo si aporta algo (si el jugador ya escribió eso, no hace falta)
export function recognizedName(typed: string | null, canonical: string | null): string | null {
  if (!canonical) return null;
  return normalize(typed) === normalize(canonical) ? null : canonical;
}
