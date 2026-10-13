import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { clockOffset, secondsUntil } from './clock';
import { MemoryRouter } from 'react-router-dom';
import { MultiRoundResults, Standings } from './MultiRoundResults';
import { MultiFinal } from './MultiParts';
import { listaNombres } from './players';
import type { RoomApi } from './useRoom';
import type { RoomSnapshot, RoundResult, Standing } from './types';

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

describe('empate en el primer puesto', () => {
  const fila = (userId: string, username: string, points: number, position: number, result: Standing['result']): Standing => ({
    userId, username, points, position, won: result === 'win', result, abandoned: false,
  });
  const empate3 = [fila('a', 'Ana', 50, 1, 'draw'), fila('b', 'Beto', 50, 1, 'draw'), fila('c', 'Caro', 50, 1, 'draw'), fila('d', 'Dani', 10, 4, 'loss')];

  const final = (me: string, standings: Standing[], empatados: string[]) =>
    renderToStaticMarkup(
      <MemoryRouter>
        <MultiFinal
          room={{} as RoomApi}
          state={{
            me, game: 'trivia', isPrivate: true, hostUserId: 'a', history: [], notice: null,
            final: { reason: 'completed', countsForStats: true, standings, empate: empatados.length > 0, empatados, newAchievements: [] },
          } as unknown as RoomSnapshot}
        />
      </MemoryRouter>,
    );

  it('nombres: "X y Y", "X, Y y Z" y "e" antes de un nombre que suena "i"', () => {
    expect(listaNombres(['Ana', 'Beto'])).toBe('Ana y Beto');
    expect(listaNombres(['Ana', 'Beto', 'Caro'])).toBe('Ana, Beto y Caro');
    expect(listaNombres(['Ana', 'Ignacio'])).toBe('Ana e Ignacio');
    expect(listaNombres(['Ana', 'Hilda'])).toBe('Ana e Hilda');
    expect(listaNombres(['Ana', 'Iara'])).toBe('Ana y Iara'); // "ia" no suena "i"
  });

  it('a los que empataron arriba: "¡Empate!" con apretón de manos y quiénes empataron', () => {
    const html = final('a', empate3.slice(0, 2).concat(fila('c', 'Caro', 10, 3, 'loss')), ['Ana', 'Beto']);
    expect(html).toContain('¡Empate!');
    expect(html).toContain('Empataron Ana y Beto');
    expect(html).toContain('lucide-handshake');
    expect(html).toContain('#fbbf24');
    expect(html).not.toContain('Ganaste');
    expect(html).not.toContain('Ganó');
    expect(html).not.toContain('Ganador');
  });

  it('a los demás: "Empataron X, Y y Z" en vez de "Ganó…"', () => {
    const html = final('d', empate3, ['Ana', 'Beto', 'Caro']);
    expect(html).toContain('Empataron Ana, Beto y Caro');
    expect(html).not.toContain('¡Empate!');
    expect(html).not.toContain('Ganó');
  });

  it('sin empate arriba sigue igual: "Ganó X"', () => {
    const html = final('b', [fila('a', 'Ana', 50, 1, 'win'), fila('b', 'Beto', 20, 2, 'loss'), fila('c', 'Caro', 20, 2, 'loss')], []);
    expect(html).toContain('Ganó Ana');
    expect(html).not.toContain('Empat');
  });

  it('posiciones: los empatados sin "Ganador" (con apretón de manos)', () => {
    const html = renderToStaticMarkup(<Standings me="d" standings={empate3} />);
    expect(html).not.toContain('Ganador');
    expect(html.match(/aria-label="Empató"/g)).toHaveLength(3);
  });
});
