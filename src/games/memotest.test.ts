import { describe, expect, it } from 'vitest';
import { ANCHO_CELULAR, columnasMemotest, medidasCarta, orientacionDe, type OrientacionMemotest } from '../api/memotest';
import { escucharPantalla, medirPantalla, type PantallaMemotest } from './usePantallaMemotest';
import { achievementIcon } from '../profile/achievementIcons';
import { Award } from 'lucide-react';

describe('memotest', () => {
  // columnas × filas de la grilla (siempre completa, sin huecos)
  const grilla = (cartas: number, orientacion?: OrientacionMemotest, ancho?: number) => {
    const c = columnasMemotest(cartas, orientacion, ancho);
    expect(cartas % c).toBe(0);
    return `${c}x${cartas / c}`;
  };

  it('celular (vertical): más filas que columnas', () => {
    expect(grilla(12, 'vertical')).toBe('3x4');
    expect(grilla(16, 'vertical')).toBe('4x4');
    expect(grilla(20, 'vertical')).toBe('4x5');
    expect(grilla(12)).toBe('3x4'); // sin orientación: como en el celular
  });

  it('PC (horizontal): más columnas que filas; 16 en 8×2 sólo si hay lugar', () => {
    expect(grilla(12, 'horizontal', 1280)).toBe('6x2');
    expect(grilla(16, 'horizontal', 1280)).toBe('8x2');
    expect(grilla(16, 'horizontal', 800)).toBe('4x4'); // ventana angosta: 8 columnas no se leerían
    expect(grilla(20, 'horizontal', 1280)).toBe('5x4');
  });

  it('otra cantidad de cartas: grilla completa igual', () => {
    expect(grilla(24, 'horizontal', 1280)).toBe('6x4');
    expect(grilla(24, 'vertical')).toBe('4x6');
    expect(grilla(18, 'vertical')).toBe('3x6');
  });

  it('celular = ventana angosta o parada', () => {
    expect(orientacionDe(1280, 800)).toBe('horizontal');
    expect(orientacionDe(390, 844)).toBe('vertical'); // celular parado
    expect(orientacionDe(844, 390)).toBe('horizontal'); // celular acostado
    expect(orientacionDe(ANCHO_CELULAR - 1, 300)).toBe('vertical'); // ventana achicada
    expect(orientacionDe(800, 1000)).toBe('vertical'); // tablet parada
  });

  it('cartas: apaisadas en la PC y paradas en el celular; letra más chica con muchas columnas', () => {
    expect(medidasCarta('horizontal', 6)).toMatchObject({ aspectRatio: '4 / 3', fontSize: 14 });
    expect(medidasCarta('horizontal', 8)).toMatchObject({ aspectRatio: '4 / 3', fontSize: 12 });
    expect(medidasCarta('vertical', 3)).toMatchObject({ aspectRatio: '3 / 4', fontSize: 12 });
    expect(medidasCarta('vertical', 4)).toMatchObject({ aspectRatio: '3 / 4', fontSize: 11 });
  });

  it('se actualiza al girar el celular o achicar la ventana, y deja de escuchar al desmontar', () => {
    const oyentes = { resize: new Set<() => void>(), change: new Set<() => void>() };
    const ventana = {
      innerWidth: 1280,
      innerHeight: 800,
      addEventListener: (_t: string, f: () => void) => oyentes.resize.add(f),
      removeEventListener: (_t: string, f: () => void) => oyentes.resize.delete(f),
      matchMedia: () => ({
        addEventListener: (_t: string, f: () => void) => oyentes.change.add(f),
        removeEventListener: (_t: string, f: () => void) => oyentes.change.delete(f),
      }),
    } as unknown as Window;
    const vistas: PantallaMemotest[] = [];
    expect(medirPantalla(ventana)).toEqual({ orientacion: 'horizontal', ancho: 1280 });
    const dejar = escucharPantalla(ventana, (p) => vistas.push(p));
    // Gira el celular (matchMedia) y después achica la ventana (resize)
    Object.assign(ventana, { innerWidth: 390, innerHeight: 844 });
    oyentes.change.forEach((f) => f());
    Object.assign(ventana, { innerWidth: 1000, innerHeight: 700 });
    oyentes.resize.forEach((f) => f());
    expect(vistas).toEqual([{ orientacion: 'vertical', ancho: 390 }, { orientacion: 'horizontal', ancho: 1000 }]);
    dejar();
    expect(oyentes.resize.size + oyentes.change.size).toBe(0);
  });

  it('todos los logros de los juegos nuevos tienen ícono propio', () => {
    for (const id of ['redonda_intacta', 'ahorcado_crack', 'ahorcado_diez', 'trivia_perfecta', 'trivia_rapida', 'trivia_diez',
      'diaria_perfecta', 'diaria_racha_7', 'diaria_racha_30', 'sopa_relampago', 'sopa_dificil', 'sopa_diez',
      'memotest_elefante', 'memotest_dificil', 'memotest_diez']) {
      expect({ id, generico: achievementIcon(id) === Award }).toEqual({ id, generico: false });
    }
  });
});
