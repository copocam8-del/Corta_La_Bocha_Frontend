import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import GameMenu from '../pages/GameMenu';
import BackButton, { ConfirmDialog } from '../components/BackButton';
import { ABANDONAR } from '../components/abandonar';
import { crearSalaPath, isMultiGame, menuPath, MULTI_CONFIG, MULTI_GAMES, publicaPath, tiempoLabel } from './multiConfig';
import { achievementIcon } from '../profile/achievementIcons';
import { Award } from 'lucide-react';

const menu = (game: string) =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={[`/juego/${game}`]}>
      <Routes>
        <Route path="/juego/:game" element={<GameMenu />} />
        <Route path="/dashboard" element={<p>DASHBOARD</p>} />
      </Routes>
    </MemoryRouter>,
  );

describe('menú "¿Cómo querés jugar?" de cada juego', () => {
  it('existe para Tutti Frutti, ahorcado, trivia, sopa, memotest y El Impostor (no para el desafío del día)', () => {
    expect(MULTI_GAMES).toEqual(['tutti_frutti', 'ahorcado', 'trivia', 'sopa_de_letras', 'memotest', 'impostor']);
    expect(isMultiGame('trivia_diaria')).toBe(false);
    expect(menu('trivia_diaria')).not.toContain('¿Cómo querés jugar?'); // sin menú: redirige a los juegos
  });

  it('muestra Solo / Con amigos / Online y ya no tiene ranking ni "Otros juegos"', () => {
    const html = menu('trivia');
    expect(html).toContain('¿Cómo querés jugar?');
    expect(html).toContain('Trivia');
    expect(html).toContain('Jugar solo');
    expect(html).toContain('Crear sala privada');
    expect(html).toContain('Unirse con código');
    expect(html).toContain('Partida pública');
    expect(html).not.toContain('Ranking Global');
    expect(html).not.toContain('Otros juegos');
    expect(html).toContain('Volver');
  });

  it('"Contra la IA" sólo en Tutti Frutti (en los demás no hay IA)', () => {
    expect(menu('tutti_frutti')).toContain('Contra la IA');
    for (const g of ['ahorcado', 'trivia', 'sopa_de_letras', 'memotest']) expect(menu(g)).not.toContain('Contra la IA');
  });
});

describe('opciones de las salas (copia de las del backend)', () => {
  it('los valores por defecto están entre las opciones de cada juego', () => {
    for (const g of MULTI_GAMES) {
      const c = MULTI_CONFIG[g];
      expect(c.rondas.opciones).toContain(c.defaults.rounds);
      expect(c.tiempos.opciones).toContain(c.defaults.seconds);
      if (c.tematicas) expect(c.tematicas.opciones.map((o) => o.id)).toContain(c.defaults.tematica);
      if (c.dificultades) expect(c.dificultades.map((o) => o.id)).toContain(c.defaults.dificultad);
    }
    expect(MULTI_CONFIG.tutti_frutti.dificultades).toBeUndefined(); // en multijugador no juega la máquina
  });

  it('el memotest es por turnos: hasta 4 jugadores y la pública sólo "pocos"', () => {
    expect(MULTI_CONFIG.memotest.maxPlayers).toBe(4);
    expect(MULTI_CONFIG.memotest.publica.tamanos).toEqual(['pocos']);
  });

  it('rutas de cada juego (para el botón Volver)', () => {
    expect(menuPath('sopa_de_letras')).toBe('/juego/sopa_de_letras');
    expect(crearSalaPath('trivia')).toBe('/juego/trivia/crear-sala');
    expect(publicaPath('memotest')).toBe('/juego/memotest/publica');
    expect(menuPath('inventado')).toBe('/juego/tutti_frutti');
    expect([tiempoLabel(20), tiempoLabel(180)]).toEqual(['20s', '3 min']);
  });

  it('los logros de ganar en multijugador tienen su ícono', () => {
    for (const id of ['ahorcado_multi', 'trivia_multi', 'sopa_multi', 'memotest_multi']) expect(achievementIcon(id)).not.toBe(Award);
  });
});

describe('botón Volver', () => {
  it('es igual en todas las pantallas: flecha + texto', () => {
    const html = renderToStaticMarkup(<MemoryRouter><BackButton to="/dashboard" /></MemoryRouter>);
    expect(html).toContain('data-testid="volver"');
    expect(html).toContain('Volver');
    expect(html).toContain('<svg'); // la flecha
  });

  it('en medio de una partida pregunta antes de abandonar', () => {
    expect(ABANDONAR).toMatchObject({ title: '¿Seguro que querés abandonar?', message: 'La partida cuenta como perdida.' });
    const html = renderToStaticMarkup(<ConfirmDialog text={ABANDONAR} onConfirm={() => {}} onCancel={() => {}} />);
    expect(html).toContain('¿Seguro que querés abandonar?');
    expect(html).toContain('La partida cuenta como perdida.');
    expect(html).toContain('Seguir jugando');
  });
});
