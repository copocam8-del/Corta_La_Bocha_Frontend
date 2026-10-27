import { describe, expect, it } from 'vitest';
import manifestRaw from '../public/manifest.webmanifest?raw';
import indexHtml from '../index.html?raw';
import mainTsx from './main.tsx?raw';

// La PWA (y la app de Play Store, que es la misma página envuelta) necesita el manifest y sus íconos
const manifest = JSON.parse(manifestRaw) as {
  name: string; start_url: string; display: string; icons: { src: string; sizes: string; purpose: string }[];
};

// Los PNG de public/ como data URL (base64): de ahí se lee el ancho y alto del encabezado IHDR (bytes 16 a 23)
const pngs = import.meta.glob('../public/*.png', { query: '?inline', import: 'default', eager: true }) as Record<string, string>;
function medidaPng(dataUrl: string) {
  const bin = atob(dataUrl.split(',')[1]);
  const u32 = (i: number) => ((bin.charCodeAt(i) << 24) | (bin.charCodeAt(i + 1) << 16) | (bin.charCodeAt(i + 2) << 8) | bin.charCodeAt(i + 3)) >>> 0;
  return `${u32(16)}x${u32(20)}`;
}

describe('PWA: manifest e íconos', () => {
  it('el index.html enlaza el manifest', () => {
    expect(indexHtml).toContain('<link rel="manifest" href="/manifest.webmanifest" />');
  });

  it('se abre en pantalla completa, en el Dashboard', () => {
    expect(manifest.name).toBe('Corta La Bocha');
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBe('/dashboard');
  });

  it('tiene ícono de 192, de 512 y uno adaptable (maskable) de 512, y cada archivo mide lo que dice', () => {
    const tipos = manifest.icons.map((i) => `${i.sizes} ${i.purpose}`);
    expect(tipos).toEqual(expect.arrayContaining(['192x192 any', '512x512 any', '512x512 maskable']));
    for (const icono of manifest.icons) {
      const png = pngs[`../public${icono.src}`];
      expect(png, icono.src).toBeDefined();
      expect(medidaPng(png)).toBe(icono.sizes);
    }
  });

  it('no registra ningún service worker (sw.js es sólo el de limpieza)', () => {
    expect(mainTsx).not.toContain('serviceWorker.register');
  });
});
