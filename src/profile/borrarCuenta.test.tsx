import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { AxiosError, AxiosHeaders } from 'axios';

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() }));
vi.mock('../api/axios', () => ({ default: api }));

import BorrarCuenta, { HojaBorrarCuenta } from './BorrarCuenta';
import { confirmacionCompleta, cuerpoBorrar, errorAlBorrar } from './reglasBorrarCuenta';
import { borrarMiCuenta } from '../api/profile';
import Login from '../pages/Login';

const enRouter = (el: React.ReactElement, ruta = '/profile') => renderToStaticMarkup(<MemoryRouter initialEntries={[ruta]}>{el}</MemoryRouter>);
const errorHttp = (status: number, data: object) =>
  new AxiosError('error', String(status), undefined, undefined, { status, statusText: '', data, headers: {}, config: { headers: new AxiosHeaders() } });

beforeEach(() => vi.clearAllMocks());

describe('Borrar mi cuenta', () => {
  it('el perfil tiene la zona roja con el botón (la hoja todavía cerrada)', () => {
    const html = enRouter(<BorrarCuenta username="Cami10" tieneContrasena />);
    expect(html).toMatch(/data-testid="zona-borrar-cuenta"[\s\S]*Borrar mi cuenta[\s\S]*data-testid="abrir-borrar-cuenta"/);
    expect(html).toContain('perfil, estadísticas, ranking y logros');
    expect(html).not.toContain('Borrar para siempre');
  });

  it('la hoja explica qué se borra y que es para siempre; con contraseña la pide y el botón arranca desactivado', () => {
    const html = enRouter(<HojaBorrarCuenta username="Cami10" tieneContrasena onCerrar={() => {}} />);
    for (const t of ['¿Borrar tu cuenta?', 'Tu perfil', 'estadísticas', 'ranking', 'logros', 'Es para siempre', 'Cancelar']) expect(html).toContain(t);
    expect(html).toMatch(/<input id="borrar-password"[^>]*type="password"/);
    expect(html).toMatch(/data-testid="borrar-para-siempre"[^>]*disabled|disabled[^>]*data-testid="borrar-para-siempre"/);
    expect(html).not.toContain('borrar-confirmacion');
  });

  it('cuenta de Google: pide escribir el nombre de usuario (no la contraseña)', () => {
    const html = enRouter(<HojaBorrarCuenta username="Cami10" tieneContrasena={false} onCerrar={() => {}} />);
    expect(html).toContain('escribí tu nombre de usuario (<strong>Cami10</strong>)');
    expect(html).toContain('id="borrar-confirmacion"');
    expect(html).not.toContain('borrar-password');
  });

  it('"Borrar para siempre" se activa sólo con la confirmación completa', () => {
    expect(confirmacionCompleta(true, 'Cami10', '')).toBe(false);
    expect(confirmacionCompleta(true, 'Cami10', 'x')).toBe(true);
    expect(confirmacionCompleta(false, 'Cami10', '')).toBe(false);
    expect(confirmacionCompleta(false, 'Cami10', 'Cami1')).toBe(false);
    expect(confirmacionCompleta(false, 'Cami10', '  cAMI10 ')).toBe(true);
  });

  it('manda la contraseña tal cual, o el nombre sin espacios, a DELETE /users/me', async () => {
    expect(cuerpoBorrar(true, ' clave con espacios ')).toEqual({ password: ' clave con espacios ' });
    expect(cuerpoBorrar(false, ' Cami10 ')).toEqual({ confirmacion: 'Cami10' });
    api.delete.mockResolvedValue({ data: { borrada: true } });
    expect(await borrarMiCuenta({ password: 'clave' })).toEqual({ borrada: true });
    expect(api.delete).toHaveBeenCalledWith('/users/me', { data: { password: 'clave' } });
  });

  it('si no se pudo, muestra el motivo del backend (contraseña mal, nombre que no coincide, demasiados intentos)', () => {
    expect(errorAlBorrar(errorHttp(401, { statusCode: 401, message: 'La contraseña no es correcta.' }))).toBe('La contraseña no es correcta.');
    expect(errorAlBorrar(errorHttp(400, { message: 'Escribí tu nombre de usuario para confirmar.' }))).toBe('Escribí tu nombre de usuario para confirmar.');
    expect(errorAlBorrar(errorHttp(400, { message: 'Datos inválidos', errors: { password: ['La contraseña no es correcta.'] } }))).toBe('La contraseña no es correcta.');
    expect(errorAlBorrar(errorHttp(429, { message: 'Demasiados intentos. Esperá un minuto y probá de nuevo.' }))).toMatch(/^Demasiados intentos/);
    expect(errorAlBorrar(errorHttp(500, {}))).toMatch(/servidor/);
  });

  it('después de borrar, el login dice "Tu cuenta se borró."', () => {
    expect(enRouter(<Login />, '/login?borrada=1')).toContain('Tu cuenta se borró.');
    expect(enRouter(<Login />, '/login')).not.toContain('Tu cuenta se borró.');
  });
});
