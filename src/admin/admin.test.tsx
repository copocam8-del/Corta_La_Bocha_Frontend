import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import Admin from '../pages/Admin';
import { PanelButton } from '../pages/Dashboard';
import { esAdmin, type AdminContenido, type AdminIa, type AdminPartidas, type AdminUsuarios } from '../api/admin';
import { BarrasHorizontales, BarrasPorDia } from './AdminParts';
import { TabContenido, TabIa, TabPartidas, TabUsuarios } from './AdminTabs';
import { etiquetaDia } from './adminFormat';

const usuarios: AdminUsuarios = {
  periodo: '7d', total: 1234, nuevos: 7, conGoogle: 3, conContrasena: 4,
  nuevosPorDia: [{ dia: '2026-10-12', cantidad: 5 }, { dia: '2026-10-13', cantidad: 2 }],
  activos: { hoy: 4, semana: 15, mes: 40 },
  ultimosRegistros: [{ username: 'nuevo1', email: 'nuevo1@mail.com', creado: '2026-10-13T12:00:00.000Z', conGoogle: true }],
};
const partidas: AdminPartidas = {
  periodo: '7d', total: 9, solo: 7, multijugador: 2, abandonadas: 1, abandonosMultijugador: 1,
  porJuego: { tutti_frutti: { total: 7, solo: 7, multijugador: 0, abandonadas: 1 }, memotest: { total: 2, solo: 0, multijugador: 2, abandonadas: 0 } },
  porDia: [{ dia: '2026-10-13', total: 9, juegos: { tutti_frutti: 7, memotest: 2 } }],
  enVivo: { salas: 2, jugando: 1, conectados: 5, enCola: 3, porJuego: {} },
  top: [{ username: 'messi10', puntos: 300, partidas: 4, ganadas: 3 }],
};
const ia: AdminIa = {
  periodo: '7d', proveedor: 'gemini', modelo: 'gemini-3.8-flash', configurado: true, partidasValidadas: 37, partidasSinValidar: 3,
  porcentajeSinValidar: 7.5, respuestasEvaluadas: 200, porcentajeValidas: 75, gastoEstimadoUsd: 0.37,
  notaGasto: 'Estimado: US$ 0.01 por partida validada.',
};
const contenido: AdminContenido = {
  periodo: '7d', minimoVeces: 3,
  trivia: {
    masFalladas: [{ id: 'mun044', texto: '¿Quién hizo un hat-trick en la final del Mundial 2022?', veces: 5, porcentaje: 20 }],
    masAcertadas: [],
  },
  ahorcado: [{ id: 'GAMBETA', texto: 'GAMBETA', veces: 4, porcentaje: 50 }],
  sopa: [{ id: 'clubes_argentinos', nombre: 'Clubes argentinos', cantidad: 3 }],
  memotest: [],
  letras: [{ letra: 'M', cantidad: 9 }],
  sinDatos: ['Trivia multijugador: no se guarda.'],
};

describe('panel de administración', () => {
  it('sólo es admin si /users/me dice isAdmin: true', () => {
    expect(esAdmin({ isAdmin: true })).toBe(true);
    expect(esAdmin({ isAdmin: false })).toBe(false);
    expect(esAdmin({})).toBe(false);
    expect(esAdmin(null)).toBe(false);
  });

  it('botón "Panel" en el Dashboard sólo para admins', () => {
    expect(renderToStaticMarkup(<PanelButton visible={false} onClick={() => {}} />)).toBe('');
    expect(renderToStaticMarkup(<PanelButton visible onClick={() => {}} />)).toContain('Panel');
  });

  it('la pantalla no se indexa, tiene "Volver" y no muestra nada hasta confirmar que sos admin', () => {
    const html = renderToStaticMarkup(<MemoryRouter><Admin /></MemoryRouter>);
    expect(html).toContain('<meta name="robots" content="noindex, nofollow"/>');
    expect(html).toContain('Volver');
    expect(html).toContain('data-testid="verificando"');
    expect(html).not.toContain('role="tablist"');
  });

  it('usuarios: números grandes, gráfico por día y últimos registros (con email, sin datos sensibles)', () => {
    const html = renderToStaticMarkup(<TabUsuarios d={usuarios} />);
    expect(html).toContain('1.234');
    expect(html).toContain('Con Google');
    expect(html).toContain('<svg');
    expect(html).toContain('nuevo1@mail.com');
    expect(html).toContain('13/10/2026');
    for (const prohibido of ['password', 'birth', 'nacimiento', 'token']) expect(html.toLowerCase()).not.toContain(prohibido);
  });

  it('partidas: en vivo, por juego (nombres) con leyenda y top', () => {
    const html = renderToStaticMarkup(<TabPartidas d={partidas} />);
    expect(html).toContain('Salas activas');
    expect(html).toContain('Tutti Frutti');
    expect(html).toContain('Memotest');
    expect(html).toContain('messi10');
    expect(html.match(/<rect /g)).toHaveLength(2); // una barra apilada con 2 juegos
  });

  it('IA: proveedor, porcentajes y gasto ESTIMADO', () => {
    const html = renderToStaticMarkup(<TabIa d={ia} />);
    expect(html).toContain('gemini');
    expect(html).toContain('75%');
    expect(html).toContain('7,5% del total'); // decimales con coma
    expect(html).toContain('US$ 0,37');
    expect(html).toContain('Estimado');
  });

  it('contenido: rankings, temas, letras y lo que no se guarda', () => {
    const html = renderToStaticMarkup(<TabContenido d={contenido} />);
    expect(html).toContain('hat-trick');
    expect(html).toContain('20% acierto');
    expect(html).toContain('50% derrotas');
    expect(html).toContain('Clubes argentinos');
    expect(html).toContain('No se guarda');
    expect(html).toContain('Todavía no hay datos'); // memotest y más acertadas vacíos
  });

  it('gráficos sin datos y etiquetas de días', () => {
    expect(renderToStaticMarkup(<BarrasPorDia titulo="x" dias={[{ dia: '2026-10-13', total: 0 }]} />)).toContain('Todavía no hay datos');
    expect(renderToStaticMarkup(<BarrasHorizontales filas={[]} />)).toContain('Todavía no hay datos');
    expect(etiquetaDia('2026-10-13')).toBe('13 oct');
    // 30 días: como mucho ~7 etiquetas para que entre en el celular
    const dias = Array.from({ length: 30 }, (_, i) => ({ dia: `2026-09-${String(i + 1).padStart(2, '0')}`, total: i }));
    const html = renderToStaticMarkup(<BarrasPorDia titulo="x" dias={dias} />);
    expect((html.match(/\d+ sep</g) ?? []).length).toBeLessThanOrEqual(8);
  });
});
