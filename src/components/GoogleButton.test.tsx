import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import GoogleButton from './GoogleButton';
import { saveSession, clearSession } from '../auth/session';

const render = (props: { clientId?: string; mode?: 'signin' | 'signup' }) =>
  renderToStaticMarkup(<MemoryRouter><GoogleButton {...props} /></MemoryRouter>);

describe('GoogleButton', () => {
  it('sin Client ID no muestra nada (no rompe Login ni Register)', () => {
    expect(render({ clientId: undefined })).toBe('');
    expect(render({ clientId: '' })).toBe('');
  });

  it('con Client ID muestra el lugar del botón y el separador', () => {
    const html = render({ clientId: 'abc.apps.googleusercontent.com' });
    expect(html).toContain('min-height:44px');
    expect(html).toMatch(/>\s*o\s*</);
  });
});

describe('saveSession', () => {
  const store = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  });

  afterEach(() => store.clear());

  it('guarda token, usuario y nombre, y clearSession los borra', () => {
    saveSession({ access_token: 'jwt', username: 'leo', name: 'Lionel' });
    expect(Object.fromEntries(store)).toEqual({ token: 'jwt', username: 'leo', name: 'Lionel' });
    clearSession();
    expect(store.size).toBe(0);
  });

  it('no guarda el nombre si Google no lo mandó', () => {
    saveSession({ access_token: 'jwt', username: 'leo', name: null });
    expect(store.has('name')).toBe(false);
  });
});
