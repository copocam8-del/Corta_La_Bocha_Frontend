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
    for (const proveedor of ['Vercel', 'Render', 'Supabase', 'OpenAI', 'Google (inicio de sesión)']) expect(html).toContain(proveedor);
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
