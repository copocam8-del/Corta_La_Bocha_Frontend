import { describe, expect, it } from 'vitest';
import { getTokenExpiration, isTokenExpired } from './session';

// Arma un JWT de mentira (sin firma real) con el payload que queramos
const fakeJwt = (payload: object) => {
  const b64url = (o: object) =>
    btoa(JSON.stringify(o)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${b64url({ alg: 'HS256', typ: 'JWT' })}.${b64url(payload)}.firma`;
};

const ahora = Date.UTC(2026, 9, 8, 12, 0, 0);
const enSegundos = (ms: number) => Math.floor(ms / 1000);

describe('isTokenExpired', () => {
  it('un token que vence en el futuro es válido', () => {
    expect(isTokenExpired(fakeJwt({ exp: enSegundos(ahora) + 60 }), ahora)).toBe(false);
  });

  it('un token que ya venció es inválido', () => {
    expect(isTokenExpired(fakeJwt({ exp: enSegundos(ahora) - 1 }), ahora)).toBe(true);
  });

  it('un token que vence justo ahora se considera vencido', () => {
    expect(isTokenExpired(fakeJwt({ exp: enSegundos(ahora) }), ahora)).toBe(true);
  });

  it('un token sin exp o que no es un JWT se considera vencido', () => {
    expect(isTokenExpired(fakeJwt({ sub: 'u1' }), ahora)).toBe(true);
    expect(isTokenExpired('cualquier-cosa', ahora)).toBe(true);
    expect(isTokenExpired('a.%%%.c', ahora)).toBe(true);
  });

  it('lee exp aunque el payload tenga caracteres base64url (- y _)', () => {
    const token = fakeJwt({ exp: 2000000000, username: 'ñandú_~~~>>>???' });
    expect(getTokenExpiration(token)).toBe(2000000000);
  });
});
