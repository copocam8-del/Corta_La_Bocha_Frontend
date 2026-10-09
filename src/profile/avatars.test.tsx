import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Avatar, AvatarPicker } from './avatars';
import { AVATARS, getAvatar } from './avatarData';
import { winRate } from '../api/profile';
import { getTokenUserId } from '../auth/session';

// Mismos ids que AVATAR_IDS del backend (src/users/avatars.ts)
const BACKEND_AVATAR_IDS = [
  'pelota', 'camiseta', 'arco', 'trofeo', 'medalla', 'corona',
  'escudo', 'estrella', 'bandera', 'rayo', 'fuego', 'botines',
];

describe('avatares', () => {
  it('el set coincide con el del backend', () => {
    expect(AVATARS.map((a) => a.id)).toEqual(BACKEND_AVATAR_IDS);
  });

  it('todos tienen nombre en español y no se repiten', () => {
    expect(new Set(AVATARS.map((a) => a.id)).size).toBe(AVATARS.length);
    for (const a of AVATARS) expect(a.label.length).toBeGreaterThan(2);
  });

  it('sin avatar elegido muestra la inicial', () => {
    expect(getAvatar(null)).toBeUndefined();
    expect(renderToStaticMarkup(<Avatar id={null} fallback="lionel" />)).toContain('>L<');
  });

  it('con avatar elegido lo describe para lectores de pantalla', () => {
    expect(renderToStaticMarkup(<Avatar id="trofeo" fallback="x" />)).toContain('Avatar: Trofeo');
  });

  it('el selector marca el avatar elegido', () => {
    const html = renderToStaticMarkup(<AvatarPicker value="fuego" onChange={() => {}} />);
    expect(html.match(/aria-checked="true"/g)).toHaveLength(1);
    expect(html).toContain('aria-checked="true" title="Fuego"');
  });
});

describe('estadísticas', () => {
  it('calcula el porcentaje de victorias sin dividir por cero', () => {
    expect(winRate(0, 0)).toBe(0);
    expect(winRate(3, 2)).toBe(67);
  });
});

describe('getTokenUserId', () => {
  const b64url = (o: object) => btoa(JSON.stringify(o)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  it('lee el id del usuario del token', () => {
    expect(getTokenUserId(`${b64url({ alg: 'HS256' })}.${b64url({ sub: 'u-123' })}.firma`)).toBe('u-123');
  });

  it('devuelve null si no hay token o está roto', () => {
    expect(getTokenUserId(null)).toBeNull();
    expect(getTokenUserId('basura')).toBeNull();
  });
});
