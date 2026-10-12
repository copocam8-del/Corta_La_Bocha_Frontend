import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { clockOffset, secondsUntil } from './clock';
import { MultiRoundResults, Standings } from './MultiRoundResults';
import type { RoundResult } from './types';

describe('reloj sincronizado con el servidor', () => {
  it('corrige la diferencia entre el reloj de la compu y el del servidor', () => {
    // El servidor está 5 s adelantado: la ronda termina en su hora 65 000 → faltan 60 s
    const offset = clockOffset(10_000, 5_000);
    expect(offset).toBe(5_000);
    expect(secondsUntil(70_000, offset, 5_000)).toBe(60);
    expect(secondsUntil(70_000, offset, 64_500)).toBe(1);
    expect(secondsUntil(70_000, offset, 66_000)).toBe(0);
    expect(secondsUntil(null, offset, 0)).toBe(0);
  });
});

const ronda: RoundResult = {
  number: 1,
  letter: 'M',
  bastaBy: 'Ana',
  incomplete: false,
  roundPoints: { a: 10, b: 5 },
  categories: [
    {
      category: 'Jugador',
      entries: [
        { userId: 'a', username: 'Ana', answer: 'mesi', status: 'valid', canonical: 'Lionel Messi', reason: 'Válida.', points: 10 },
        { userId: 'b', username: 'Beto', answer: 'Mesa', status: 'invalid', canonical: null, reason: 'Palabra común.', points: 0 },
      ],
    },
  ],
};

describe('resultados del multijugador', () => {
  it('muestra quién puso qué, si valió, el motivo y los puntos', () => {
    const html = renderToStaticMarkup(<MultiRoundResults result={ronda} me="a" />);
    expect(html).toContain('Vos:');
    expect(html).toContain('Beto:');
    expect(html).toContain('mesi');
    expect(html).toContain('Lionel Messi');
    expect(html).toContain('No vale');
    expect(html).toContain('Palabra común.');
    expect(html).toContain('+10');
    expect(html).not.toContain('La IA no pudo validar');
  });

  it('avisa si la IA no pudo validar', () => {
    const html = renderToStaticMarkup(<MultiRoundResults result={{ ...ronda, incomplete: true }} me="a" />);
    expect(html).toContain('La IA no pudo validar');
  });

  it('posiciones con ganador y abandono', () => {
    const html = renderToStaticMarkup(
      <Standings
        me="b"
        standings={[
          { userId: 'a', username: 'Ana', points: 50, position: 1, won: true, abandoned: false },
          { userId: 'b', username: 'Beto', points: 20, position: 2, won: false, abandoned: false },
          { userId: 'c', username: 'Caro', points: 0, position: 3, won: false, abandoned: true },
        ]}
      />,
    );
    expect(html).toContain('Ganador');
    expect(html).toContain('Beto (vos)');
    expect(html).toContain('abandonó');
    expect(html).toContain('50 pts');
  });
});
