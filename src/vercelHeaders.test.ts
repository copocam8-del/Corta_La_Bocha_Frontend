import { describe, expect, it } from 'vitest';
import vercelRaw from '../vercel.json?raw';

// Cabeceras de seguridad de vercel.json: que nadie las borre sin darse cuenta
type Header = { key: string; value: string };
const config = JSON.parse(vercelRaw) as { headers: { source: string; headers: Header[] }[] };
const todas = config.headers.find((h) => h.source === '/(.*)')!.headers;
const valor = (key: string) => todas.find((h) => h.key === key)?.value;

describe('vercel.json: cabeceras de seguridad', () => {
  it('HSTS, nosniff, DENY, Referrer-Policy y Permissions-Policy en todas las rutas', () => {
    expect(valor('Strict-Transport-Security')).toBe('max-age=31536000; includeSubDomains');
    expect(valor('X-Content-Type-Options')).toBe('nosniff');
    expect(valor('X-Frame-Options')).toBe('DENY');
    expect(valor('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(valor('Permissions-Policy')).toBe('camera=(), microphone=(), geolocation=()');
  });

  it('la CSP es Report-Only (avisa, no bloquea) y no hay una CSP que bloquee', () => {
    expect(valor('Content-Security-Policy-Report-Only')).toBeDefined();
    expect(valor('Content-Security-Policy')).toBeUndefined();
  });

  const csp = Object.fromEntries(
    valor('Content-Security-Policy-Report-Only')!
      .split(';')
      .map((d) => d.trim().split(/\s+/))
      .map(([nombre, ...fuentes]) => [nombre, fuentes]),
  );

  it('permite lo que usa la app: backend, Google, Turnstile, Google Fonts y estilos inline', () => {
    expect(csp['connect-src']).toEqual(
      expect.arrayContaining(['https://corta-la-bocha-backend.onrender.com', 'wss://corta-la-bocha-backend.onrender.com']),
    );
    expect(csp['script-src']).toEqual(expect.arrayContaining(['https://accounts.google.com/gsi/client', 'https://challenges.cloudflare.com']));
    expect(csp['frame-src']).toEqual(expect.arrayContaining(['https://accounts.google.com/gsi/', 'https://challenges.cloudflare.com']));
    expect(csp['style-src']).toEqual(expect.arrayContaining(["'unsafe-inline'", 'https://fonts.googleapis.com']));
    expect(csp['font-src']).toContain('https://fonts.gstatic.com');
  });

  it('no permite scripts inline ni eval, ni plugins, ni que nos metan en un iframe', () => {
    expect(csp['script-src']).not.toContain("'unsafe-inline'");
    expect(csp['script-src']).not.toContain("'unsafe-eval'");
    expect(csp['object-src']).toEqual(["'none'"]);
    expect(csp['frame-ancestors']).toEqual(["'none'"]);
  });

  it('sw.js sigue sin caché (service worker de limpieza)', () => {
    const sw = config.headers.find((h) => h.source === '/sw.js')!.headers;
    expect(sw).toContainEqual({ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' });
  });
});
