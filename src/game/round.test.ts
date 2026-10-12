import { describe, expect, it } from 'vitest';
import { missingCategories, secondsLeft } from './round';

describe('reloj de la ronda', () => {
  it('cuenta contra la hora de fin, redondeando para arriba', () => {
    expect(secondsLeft(60_000, 0)).toBe(60);
    expect(secondsLeft(60_000, 100)).toBe(60);
    expect(secondsLeft(60_000, 1_000)).toBe(59);
    expect(secondsLeft(60_000, 59_999)).toBe(1);
  });

  it('nunca da negativo (si la pestaña estuvo frenada, termina en 0)', () => {
    expect(secondsLeft(60_000, 60_000)).toBe(0);
    expect(secondsLeft(60_000, 95_000)).toBe(0);
  });
});

describe('¡Basta!', () => {
  it('sólo con todas las categorías completas (los espacios no cuentan)', () => {
    expect(missingCategories(['Jugador', 'Equipo'], { Jugador: 'Messi', Equipo: 'Milan' })).toEqual([]);
    expect(missingCategories(['Jugador', 'Equipo'], { Jugador: 'Messi', Equipo: '   ' })).toEqual(['Equipo']);
    expect(missingCategories(['Jugador', 'Equipo'], {})).toEqual(['Jugador', 'Equipo']);
  });
});
