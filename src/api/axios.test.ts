import { describe, expect, it } from 'vitest';
import { esSesionVencida } from './axios';

const error = (url: string, method: string, status: number, message?: string) => ({ config: { url, method }, response: { status, data: { message } } });

describe('401 del backend', () => {
  it('con token vencido o de una cuenta borrada: la sesión se cierra', () => {
    expect(esSesionVencida(error('/users/me', 'get', 401, 'Unauthorized'))).toBe(true);
    expect(esSesionVencida(error('/users/me', 'delete', 401, 'Unauthorized'))).toBe(true);
    expect(esSesionVencida(error('/ahorcado', 'post', 401))).toBe(true);
  });

  it('contraseña mal en el login o al borrar la cuenta: NO cierra la sesión (la pantalla muestra el error)', () => {
    expect(esSesionVencida(error('/auth/login', 'post', 401))).toBe(false);
    expect(esSesionVencida(error('/users/me', 'delete', 401, 'La contraseña no es correcta.'))).toBe(false);
  });

  it('otros errores no son sesión vencida', () => {
    expect(esSesionVencida(error('/users/me', 'delete', 400, 'Escribí tu nombre de usuario para confirmar.'))).toBe(false);
    expect(esSesionVencida({})).toBe(false);
  });
});
