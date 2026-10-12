import { describe, expect, it } from 'vitest';
import { celdasEntre, lineaRecta } from './sopaLinea';

describe('selección de la sopa de letras', () => {
  it('se pega a la dirección recta más cercana', () => {
    expect(lineaRecta({ f: 5, c: 5 }, { f: 5, c: 9 }, 12)).toEqual({ f: 5, c: 9 }); // horizontal
    expect(lineaRecta({ f: 5, c: 5 }, { f: 6, c: 9 }, 12)).toEqual({ f: 5, c: 9 }); // casi horizontal
    expect(lineaRecta({ f: 5, c: 5 }, { f: 8, c: 7 }, 12)).toEqual({ f: 8, c: 8 }); // casi diagonal
    expect(lineaRecta({ f: 5, c: 5 }, { f: 1, c: 5 }, 12)).toEqual({ f: 1, c: 5 }); // hacia arriba
    expect(lineaRecta({ f: 5, c: 5 }, { f: 5, c: 5 }, 12)).toEqual({ f: 5, c: 5 });
  });

  it('no se sale de la grilla', () => {
    expect(lineaRecta({ f: 8, c: 8 }, { f: 9, c: 14 }, 10)).toEqual({ f: 8, c: 9 });
  });

  it('lista las celdas de la línea en orden', () => {
    expect(celdasEntre({ f: 2, c: 2 }, { f: 0, c: 0 })).toEqual([{ f: 2, c: 2 }, { f: 1, c: 1 }, { f: 0, c: 0 }]);
  });
});
