import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import TurnstileWidget from './TurnstileWidget';
import { CaptchaToken } from '../auth/turnstile';
import { registerPayload, type RegisterForm } from '../auth/rules';

const form: RegisterForm = {
  name: ' Leo ', lastName: 'Messi', username: '', birthDate: '1987-06-24', country: 'Argentina', email: ' leo@mail.com ', password: 'gambeta-de-potrero',
};

describe('TurnstileWidget', () => {
  it('sin site key no dibuja nada (el registro queda como siempre)', () => {
    expect(renderToStaticMarkup(<TurnstileWidget captcha={new CaptchaToken()} siteKey={undefined} />)).toBe('');
    expect(renderToStaticMarkup(<TurnstileWidget captcha={new CaptchaToken()} siteKey="" />)).toBe('');
  });

  it('con site key deja el lugar para el widget', () => {
    expect(renderToStaticMarkup(<TurnstileWidget captcha={new CaptchaToken()} siteKey="0x4AAAA" />)).toContain('data-testid="turnstile"');
  });
});

describe('Register sin VITE_TURNSTILE_SITE_KEY', () => {
  it('no muestra el captcha', async () => {
    const { default: Register } = await import('../pages/Register');
    const html = renderToStaticMarkup(<MemoryRouter><Register /></MemoryRouter>);
    expect(html).toContain('¡A jugar!');
    expect(html).not.toContain('data-testid="turnstile"');
  });
});

describe('registerPayload', () => {
  it('sin captcha manda lo mismo que antes (sin captchaToken)', () => {
    expect(registerPayload(form)).toEqual({ ...form, name: 'Leo', email: 'leo@mail.com' });
    expect(registerPayload(form)).not.toHaveProperty('captchaToken');
  });

  it('con captcha agrega captchaToken', () => {
    expect(registerPayload(form, 'tok')).toMatchObject({ captchaToken: 'tok', email: 'leo@mail.com' });
  });
});

describe('CaptchaToken', () => {
  afterEach(() => vi.useRealTimers());

  it('si el token ya llegó, lo devuelve al toque', async () => {
    const c = new CaptchaToken();
    c.set('abc');
    await expect(c.get()).resolves.toBe('abc');
  });

  it('si todavía no llegó, lo espera', async () => {
    const c = new CaptchaToken();
    const pedido = c.get();
    c.set('xyz');
    await expect(pedido).resolves.toBe('xyz');
  });

  it('si el widget falla, devuelve null (para mostrar el error)', async () => {
    const c = new CaptchaToken();
    const pedido = c.get();
    c.fail();
    await expect(pedido).resolves.toBeNull();
  });

  it('si no llega a tiempo, devuelve null', async () => {
    vi.useFakeTimers();
    const c = new CaptchaToken();
    const pedido = c.get(1000);
    vi.advanceTimersByTime(1001);
    await expect(pedido).resolves.toBeNull();
  });

  it('reset y expire borran el token (sirve una sola vez) y reset reinicia el widget', async () => {
    const c = new CaptchaToken();
    const reiniciar = vi.fn();
    c.onReset = reiniciar;
    c.set('uno');
    c.reset();
    expect(reiniciar).toHaveBeenCalledOnce();
    vi.useFakeTimers();
    const pedido = c.get(500);
    vi.advanceTimersByTime(501);
    await expect(pedido).resolves.toBeNull();
    c.set('dos');
    c.expire();
    const otro = c.get(500);
    vi.advanceTimersByTime(501);
    await expect(otro).resolves.toBeNull();
  });
});
