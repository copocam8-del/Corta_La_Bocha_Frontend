import { describe, expect, it } from 'vitest';
import { columnasMemotest } from '../api/memotest';
import { achievementIcon } from '../profile/achievementIcons';
import { Award } from 'lucide-react';

describe('memotest', () => {
  it('grilla cómoda en el celular: 3 columnas para 12 cartas, 4 para 16 y 20', () => {
    expect(columnasMemotest(12)).toBe(3);
    expect(columnasMemotest(16)).toBe(4);
    expect(columnasMemotest(20)).toBe(4);
  });

  it('todos los logros de los juegos nuevos tienen ícono propio', () => {
    for (const id of ['redonda_intacta', 'ahorcado_crack', 'ahorcado_diez', 'trivia_perfecta', 'trivia_rapida', 'trivia_diez',
      'diaria_perfecta', 'diaria_racha_7', 'diaria_racha_30', 'sopa_relampago', 'sopa_dificil', 'sopa_diez',
      'memotest_elefante', 'memotest_dificil', 'memotest_diez']) {
      expect({ id, generico: achievementIcon(id) === Award }).toEqual({ id, generico: false });
    }
  });
});
