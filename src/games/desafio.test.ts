import { describe, expect, it } from 'vitest';
import { cuadraditos, cuentaRegresiva } from '../api/desafio';

describe('desafío del día', () => {
  it('convierte el resultado en cuadraditos sin spoilers', () => {
    expect(cuadraditos('VXTVV')).toBe('🟩🟥⬛🟩🟩');
  });

  it('cuenta regresiva hasta el próximo', () => {
    expect(cuentaRegresiva(3_723_000)).toBe('01:02:03');
    expect(cuentaRegresiva(-5)).toBe('00:00:00');
  });
});
