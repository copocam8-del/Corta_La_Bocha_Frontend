import { describe, expect, it } from 'vitest';
import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios';
import { parseAuthError } from './apiErrors';

const respuesta = (status: number, data: unknown) => {
  const config = { headers: new AxiosHeaders() };
  const response = { status, data, statusText: '', headers: {}, config } as AxiosResponse;
  return new AxiosError('error', String(status), config, {}, response);
};

describe('parseAuthError', () => {
  it('400: toma el primer mensaje de cada campo', () => {
    const err = respuesta(400, {
      message: 'Datos inválidos',
      errors: { email: ['El email no es válido'], password: ['Ingresá una contraseña', 'otro'] },
    });
    expect(parseAuthError(err)).toEqual({
      fieldErrors: { email: 'El email no es válido', password: 'Ingresá una contraseña' },
      message: '',
    });
  });

  it('401: credenciales incorrectas', () => {
    expect(parseAuthError(respuesta(401, { message: 'Credenciales inválidas' })).message).toBe(
      'Email o contraseña incorrectos',
    );
  });

  it('409: marca el campo repetido', () => {
    expect(parseAuthError(respuesta(409, { message: 'Email ya registrado' })).fieldErrors).toEqual({
      email: 'Ya hay una cuenta con ese email',
    });
    expect(parseAuthError(respuesta(409, { message: 'Nombre de usuario ya en uso' })).fieldErrors).toEqual({
      username: 'Ese nombre de usuario ya está en uso',
    });
  });

  it('500: mensaje genérico en español, sin detalles técnicos', () => {
    expect(parseAuthError(respuesta(500, { message: 'Internal server error' })).message).toBe(
      'El servidor tuvo un problema. Probá de nuevo en un rato.',
    );
  });

  it('sin respuesta: avisa que el servidor puede estar despertando', () => {
    const err = new AxiosError('Network Error', 'ERR_NETWORK', { headers: new AxiosHeaders() }, {});
    expect(parseAuthError(err).message).toMatch(/No se pudo conectar/);
  });

  it('error que no es de axios', () => {
    expect(parseAuthError(new Error('x')).message).toBe('Ocurrió un error inesperado.');
  });
});
