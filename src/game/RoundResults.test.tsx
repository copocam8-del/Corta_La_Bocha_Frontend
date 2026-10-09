import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import RoundResults from './RoundResults';
import { recognizedName, STATUS_LABEL } from './answerStatus';
import type { CategoryResult } from '../api/soloMatch';

const fila = (over: Partial<CategoryResult> = {}): CategoryResult => ({
  category: 'Jugador',
  userAnswer: 'mesi',
  status: 'valid',
  isValid: true,
  canonical: 'Lionel Messi',
  reason: 'Jugador argentino.',
  points: 10,
  machine: { answer: 'Maradona', status: 'valid', isValid: true, canonical: 'Diego Maradona', reason: 'Válida.', points: 10 },
  ...over,
});

describe('detalle de la ronda', () => {
  it('muestra por cada respuesta si valió, los puntos, el motivo y el nombre que reconoció la IA', () => {
    const html = renderToStaticMarkup(<RoundResults results={[fila()]} />);
    expect(html).toContain('mesi');
    expect(html).toContain('Válida');
    expect(html).toContain('+10');
    expect(html).toContain('Jugador argentino.');
    expect(html).toContain('La IA reconoció: <strong>Lionel Messi</strong>');
    expect(html).toContain('Maradona'); // también la respuesta de la máquina
  });

  it('las respuestas sin validar se ven como tales y con 0 puntos', () => {
    const html = renderToStaticMarkup(
      <RoundResults results={[fila({ status: 'unverified', isValid: false, canonical: null, reason: 'No se pudo validar.', points: 0 })]} />,
    );
    expect(html).toContain('Sin validar');
    expect(html).toContain('No se pudo validar.');
    expect(html).toContain('+0');
  });

  it('todos los estados tienen texto en español', () => {
    expect(STATUS_LABEL).toEqual({ valid: 'Válida', invalid: 'No vale', empty: 'Sin respuesta', unverified: 'Sin validar' });
  });

  it('el nombre reconocido sólo se muestra si es distinto de lo que escribió el jugador', () => {
    expect(recognizedName('mesi', 'Lionel Messi')).toBe('Lionel Messi');
    expect(recognizedName('Lionel MESSI', 'Lionel Messi')).toBeNull();
    expect(recognizedName('Mesa', null)).toBeNull();
  });
});
