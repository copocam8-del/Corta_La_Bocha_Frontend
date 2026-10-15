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

  it('429: demasiados intentos', () => {
    expect(parseAuthError(respuesta(429, { message: 'x' })).message).toBe(
      'Demasiados intentos. Esperá un minuto y probá de nuevo.',
    );
  });

  it('429 por email: muestra cuánto esperar (15 minutos)', () => {
    const msg = 'Demasiados intentos con este email. Esperá 15 minutos y probá de nuevo.';
    expect(parseAuthError(respuesta(429, { statusCode: 429, message: msg })).message).toBe(msg);
  });

  it('400 del captcha: queda en el campo captchaToken', () => {
    const err = respuesta(400, { message: 'Datos inválidos', errors: { captchaToken: ['No pudimos verificar que seas una persona.'] } });
    expect(parseAuthError(err).fieldErrors).toEqual({ captchaToken: 'No pudimos verificar que seas una persona.' });
  });

  it('503 del captcha: muestra el mensaje del backend', () => {
    const msg = 'No pudimos verificar el captcha. Probá de nuevo en un rato.';
    expect(parseAuthError(respuesta(503, { message: msg })).message).toBe(msg);
    expect(parseAuthError(respuesta(503, { message: 'upstream connect error' })).message).toBe(
      'El servidor tuvo un problema. Probá de nuevo en un rato.',
    );
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
