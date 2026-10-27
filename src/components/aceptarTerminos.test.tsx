import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// La API simulada: /users/me y aceptar-terminos
const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock('../api/axios', () => ({ default: api }));

import ProtectedRoute from './ProtectedRoute';
import AceptarTerminos from './AceptarTerminos';
import { aceptarTerminos, consultarTerminos, marcarTerminosAlDia, terminosAlDia } from '../auth/terminos';

// localStorage de mentira (los tests corren sin navegador)
const guardado = new Map<string, string>();
Object.assign(globalThis, {
  localStorage: {
    getItem: (k: string) => guardado.get(k) ?? null,
    setItem: (k: string, v: string) => void guardado.set(k, v),
    removeItem: (k: string) => void guardado.delete(k),
  },
});
const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, '');
const TOKEN = `${b64({ alg: 'HS256' })}.${b64({ sub: 'u1', exp: Math.floor(Date.now() / 1000) + 3600 })}.firma`;

const privada = () =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/dashboard" element={<ProtectedRoute><p>PANTALLA PRIVADA</p></ProtectedRoute>} />
        <Route path="/login" element={<p>LOGIN</p>} />
      </Routes>
    </MemoryRouter>,
  );

beforeEach(() => {
  guardado.clear();
  marcarTerminosAlDia(null);
  vi.clearAllMocks();
});

describe('aceptar los Términos y la Política de privacidad', () => {
  it('la pantalla tiene el título, los dos links en otra pestaña, la casilla y "Cerrar sesión"', () => {
    const html = renderToStaticMarkup(<MemoryRouter><AceptarTerminos version="2026-10-27" onAceptado={() => {}} /></MemoryRouter>);
    expect(html).toContain('Actualizamos los Términos y la Política de privacidad');
    expect(html).toMatch(/href="\/terminos" target="_blank" rel="noopener noreferrer"/);
    expect(html).toMatch(/href="\/privacidad" target="_blank" rel="noopener noreferrer"/);
    expect(html).toContain('Leí y acepto los Términos y la Política de privacidad');
    expect(html).toContain('Cerrar sesión');
  });

  it('"Aceptar y seguir" va en la barra fija de abajo y arranca desactivado (sin la casilla)', () => {
    const html = renderToStaticMarkup(<MemoryRouter><AceptarTerminos version="2026-10-27" onAceptado={() => {}} /></MemoryRouter>);
    expect(html).toMatch(/data-testid="ui-barra"[\s\S]*Marcá la casilla para seguir\.[\s\S]*data-testid="aceptar-y-seguir"[^>]*disabled/);
    expect(html).toMatch(/<input type="checkbox"[^>]*data-testid="casilla-terminos"/);
    expect(html).not.toMatch(/data-testid="casilla-terminos"[^>]*checked/);
  });

  it('sin sesión, una pantalla privada no muestra nada (redirige al login) y no pregunta por los Términos', () => {
    expect(privada()).toBe(''); // <Navigate> redirige al montarse; acá no se dibuja nada
    expect(api.get).not.toHaveBeenCalled();
  });

  it('con sesión, hasta saber si aceptó no muestra la pantalla privada (ni se puede jugar)', () => {
    guardado.set('token', TOKEN);
    const html = privada();
    expect(html).not.toContain('PANTALLA PRIVADA');
    expect(html).toContain('data-testid="terminos-cargando"');
  });

  it('con los Términos al día para ese token, muestra la pantalla privada; con otro token vuelve a preguntar', () => {
    guardado.set('token', TOKEN);
    marcarTerminosAlDia(TOKEN);
    expect(privada()).toContain('PANTALLA PRIVADA');
    expect(terminosAlDia('otro-token')).toBe(false);
  });

  it('lee terminosPendientes y la versión de /users/me, y acepta mandando esa versión', async () => {
    api.get.mockResolvedValue({ data: { username: 'cami', terminosPendientes: true, terminosVersion: '2026-10-27' } });
    expect(await consultarTerminos()).toEqual({ pendientes: true, version: '2026-10-27' });
    expect(api.get).toHaveBeenCalledWith('/users/me');

    api.get.mockResolvedValue({ data: { username: 'cami', terminosPendientes: false, terminosVersion: '2026-10-27' } });
    expect((await consultarTerminos()).pendientes).toBe(false);

    api.post.mockResolvedValue({ data: { terminosPendientes: false } });
    await aceptarTerminos('2026-10-27');
    expect(api.post).toHaveBeenCalledWith('/users/me/aceptar-terminos', { version: '2026-10-27' });
  });
});
