import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import Pelota from './Pelota';
import { etapaPelota } from './pelotaEtapas';

describe('la redonda del ahorcado', () => {
  it('se desinfla de a poco con cada error', () => {
    const inflada = etapaPelota(0, 6);
    const media = etapaPelota(3, 6);
    const muerta = etapaPelota(6, 6);
    expect(inflada).toMatchObject({ scaleX: 1, scaleY: 1, muerta: false });
    expect(media.scaleY).toBeLessThan(1);
    expect(media.scaleY).toBeGreaterThan(muerta.scaleY);
    expect(muerta.muerta).toBe(true);
    expect(etapaPelota(9, 6).scaleY).toBe(muerta.scaleY); // nunca más allá del final
  });

  it('se dibuja con su descripción para lectores de pantalla', () => {
    const html = renderToStaticMarkup(<Pelota errores={2} max={6} />);
    expect(html).toContain('Pelota: 2 de 6 errores');
  });
});
