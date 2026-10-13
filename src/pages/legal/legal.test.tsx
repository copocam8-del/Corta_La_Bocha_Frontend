import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement } from 'react';
import Privacidad from './Privacidad';
import Terminos from './Terminos';
import Cookies from './Cookies';

const render = (page: ReactElement, path: string) =>
  renderToStaticMarkup(<MemoryRouter initialEntries={[path]}>{page}</MemoryRouter>);

describe('páginas legales', () => {
  it('la política de privacidad incluye los avisos obligatorios de la Ley 25.326', () => {
    const html = render(<Privacidad />, '/privacidad');
    expect(html).toContain('Ley 25.326');
    expect(html).toContain('AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA');
    expect(html).toContain('artículo 14, inciso 3');
  });

  it('la política de privacidad nombra a todos los proveedores que reciben datos', () => {
    const html = render(<Privacidad />, '/privacidad');
    for (const proveedor of ['Vercel', 'Render', 'Supabase', 'OpenAI', 'Google (inicio de sesión)', 'Brevo (Sendinblue)']) expect(html).toContain(proveedor);
    expect(html).not.toContain('PROVEEDOR DE EMAIL'); // ya está completo
  });

  it('explica qué guardamos si entrás con Google', () => {
    const html = render(<Privacidad />, '/privacidad');
    expect(html).toContain('podés registrarte y entrar con tu cuenta de Google');
    expect(html).toContain('guardamos tu nombre, tu');
    expect(html).toContain('identificador de tu cuenta de Google');
    expect(html).toContain('13 de octubre de 2026');
  });

  it('la política de cookies describe lo que se guarda en localStorage', () => {
    const html = render(<Cookies />, '/cookies');
    for (const clave of ['token', 'username', 'name']) expect(html).toContain(`<code>${clave}</code>`);
  });

  it.each([
    ['privacidad', <Privacidad />],
    ['terminos', <Terminos />],
    ['cookies', <Cookies />],
  ])('/%s muestra los datos que faltan completar como marcadores visibles', (ruta, page) => {
    const html = render(page, `/${ruta}`);
    expect(html).toContain('[EMAIL DE CONTACTO]');
    expect(html).toContain('Última actualización');
  });
});
