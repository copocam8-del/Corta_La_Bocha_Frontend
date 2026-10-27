import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement } from 'react';
import Privacidad from './Privacidad';
import Terminos from './Terminos';
import Cookies from './Cookies';
import BorrarCuenta from './BorrarCuenta';
import LegalFooter from '../../components/LegalFooter';

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
    for (const proveedor of ['Vercel', 'Render', 'Supabase', 'Google Gemini', 'Google (inicio de sesión)', 'Brevo (Sendinblue)', 'Cloudflare Turnstile']) {
      expect(html).toContain(proveedor);
    }
    expect(html).not.toContain('PROVEEDOR DE EMAIL'); // ya está completo
    // La IA recibe las respuestas, sin datos personales
    expect(html).toContain('Sólo le enviamos la letra de la ronda, las categorías y las respuestas escritas');
  });

  it('cuenta los backups: copia diaria cifrada en Google Drive y GitHub, que se borra a los 30 días', () => {
    const html = render(<Privacidad />, '/privacidad');
    for (const t of ['todos los días', 'cifrada', 'Google Drive', 'GitHub', '30 días']) expect(html).toContain(t);
  });

  it('dice quién es el responsable, dónde y cómo contactarlo, y mantiene la edad mínima de 13 años', () => {
    const html = render(<Privacidad />, '/privacidad');
    expect(html).toContain('CLB Devs (responsable: Camila Copo)');
    expect(html).toContain('Ciudad Autónoma de Buenos Aires, Argentina');
    expect(html).toContain('clbdevelopers@outlook.es');
    expect(html).toContain('<strong>13 años</strong>');
    expect(html).toContain('Fecha y versión de los Términos');
    expect(render(<Terminos />, '/terminos')).toContain('tribunales ordinarios de la Ciudad Autónoma de Buenos Aires');
  });

  it('explica qué guardamos si entrás con Google', () => {
    const html = render(<Privacidad />, '/privacidad');
    expect(html).toContain('podés registrarte y entrar con tu cuenta de Google');
    expect(html).toContain('guardamos tu nombre, tu');
    expect(html).toContain('identificador de tu cuenta de Google');
    expect(html).toContain('27 de octubre de 2026');
  });

  it('la política de cookies describe lo que se guarda en localStorage', () => {
    const html = render(<Cookies />, '/cookies');
    for (const clave of ['token', 'username', 'name']) expect(html).toContain(`<code>${clave}</code>`);
  });

  it.each([
    ['privacidad', <Privacidad />],
    ['terminos', <Terminos />],
    ['cookies', <Cookies />],
    ['borrar-cuenta', <BorrarCuenta />],
  ])('/%s ya no tiene datos por completar y tiene el email de contacto', (ruta, page) => {
    const html = render(page, `/${ruta}`);
    expect(html).not.toContain('<mark');
    expect(html).not.toMatch(/\[[A-ZÁÉÍÓÚ /]{4,}\]/); // ningún "[DATO EN MAYÚSCULAS]"
    expect(html).toContain('clbdevelopers@outlook.es');
    expect(html).toContain('Última actualización: 27 de octubre de 2026');
  });

  it('ningún archivo usa el marcador <Falta> (ya no existe)', () => {
    const fuentes = import.meta.glob('../../**/*.tsx', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
    const con = Object.entries(fuentes).filter(([archivo, texto]) => !archivo.includes('.test.') && /<Falta>/.test(texto));
    expect(con.map(([archivo]) => archivo)).toEqual([]);
  });

  it('/borrar-cuenta explica cómo borrarla desde la app, qué se borra, los backups y qué hacer si no podés entrar', () => {
    const html = render(<BorrarCuenta />, '/borrar-cuenta');
    for (const t of ['<strong>Perfil</strong>', '<strong>Borrar mi cuenta</strong>', '<strong>Borrar para siempre</strong>', 'nombre de usuario']) expect(html).toContain(t);
    for (const t of ['estadísticas', 'ranking', 'logros', 'perfil']) expect(html).toContain(t);
    expect(html).toContain('<strong>30 días</strong>');
    expect(html).toContain('se borran solas');
    expect(html).toContain('href="mailto:clbdevelopers@outlook.es?subject=Borrar%20mi%20cuenta"');
    expect(html).toContain('<strong>desde el email de tu cuenta</strong>');
  });

  it('la política de privacidad dice cómo borrar la cuenta y linkea /borrar-cuenta', () => {
    const html = render(<Privacidad />, '/privacidad');
    expect(html).toContain('<strong>Perfil → Borrar mi');
    expect(html).toContain('href="/borrar-cuenta"');
    expect(html).toContain('quedan sólo los resultados de los demás jugadores');
  });

  it('el pie legal y el menú de las páginas legales linkean /borrar-cuenta', () => {
    expect(render(<LegalFooter />, '/login')).toContain('href="/borrar-cuenta"');
    expect(render(<Cookies />, '/cookies')).toMatch(/aria-label="Páginas legales"[\s\S]*href="\/borrar-cuenta"/);
  });
});
