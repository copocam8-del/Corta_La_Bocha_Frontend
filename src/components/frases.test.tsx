import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import FraseRotativa from './FraseRotativa';
import { FRASE_MS, FRASES, fraseActual, fraseAlAzar, siguienteFrase } from './frases';

describe('frases que rotan', () => {
  it('están las 13 frases, sin repetir', () => {
    expect(FRASES).toHaveLength(13);
    expect(new Set(FRASES).size).toBe(13);
    expect(FRASES).toContain('Pisala, pomelo');
    expect(FRASES).toContain('Fallllllta');
  });

  it('pasan de a una y al final vuelven a empezar; cambian cada unos segundos', () => {
    expect(siguienteFrase(0)).toBe(1);
    expect(siguienteFrase(FRASES.length - 1)).toBe(0);
    expect(FRASE_MS).toBeGreaterThanOrEqual(3000);
    expect(FRASE_MS).toBeLessThanOrEqual(6000);
  });

  it('empieza por una al azar (siempre una que existe)', () => {
    expect(fraseAlAzar(() => 0)).toBe(0);
    expect(fraseAlAzar(() => 0.5)).toBe(6);
    expect(fraseAlAzar(() => 0.999999)).toBe(FRASES.length - 1);
    expect(fraseActual()).toBeGreaterThanOrEqual(0);
    expect(fraseActual()).toBeLessThan(FRASES.length);
    const salidas = new Set(Array.from({ length: 200 }, () => fraseAlAzar()));
    expect(salidas.size).toBeGreaterThan(5); // no arranca siempre por la misma
  });

  it('muestra una frase con el estilo que se le pasa', () => {
    const html = renderToStaticMarkup(<FraseRotativa style={{ color: '#7CFFB2' }} />);
    expect(FRASES.some((f) => html.includes(f.replace("'", '&#x27;')))).toBe(true);
    expect(html).toContain('color:#7CFFB2');
  });

  it('ninguna pantalla dice "Temporada 2025" ni "Temporada 2026"', () => {
    const fuentes = import.meta.glob('../**/*.tsx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
    const con = Object.entries(fuentes).filter(([archivo, texto]) => !archivo.includes('.test.') && /Temporada 20\d\d/.test(texto));
    expect(con.map(([archivo]) => archivo)).toEqual([]);
  });
});
