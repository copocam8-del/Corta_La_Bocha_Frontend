import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Shapes } from 'lucide-react';
import GameMenu from '../../pages/GameMenu';
import CreateRoom from '../../pages/CreateRoom';
import GameSetup from '../../pages/GameSetup';
import { Sala } from '../../pages/Room';
import { AjusteElegible } from './JuegoUI';
import { COMO_JUGAR } from '../comoJugar';
import { MULTI_GAMES } from '../multiConfig';
import type { RoomApi } from '../../multi/useRoom';
import type { RoomSnapshot } from '../../multi/types';
import type { ImpostorView } from '../../multi/gameViews';

// Todos los juegos con el formato de El Impostor (games/ui): "?" con Cómo jugar, opciones como lista de ajustes y
// el botón principal en la barra fija de abajo (con un espacio del mismo alto al final, para no tapar nada).

const en = (ruta: string, patron: string, elemento: React.ReactNode) =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={[ruta]}>
      <Routes><Route path={patron} element={elemento} /></Routes>
    </MemoryRouter>,
  );

const sala = (me: string, cambios: Partial<RoomSnapshot> = {}) => {
  const state = {
    code: 'ABC123', game: 'trivia', isPrivate: true, me, hostUserId: 'a', phase: 'lobby', settings: { tematica: 'todas', dificultad: 'mezcla', rounds: 10, seconds: 20 },
    minPlayers: 2, maxPlayers: 8, serverNow: Date.now(), round: null, nextAt: null, lastResult: null, history: [], view: null, final: null, notice: null,
    players: ['a', 'b'].map((id, i) => ({ userId: id, username: ['Ana', 'Beto'][i], avatarId: null, connected: true, left: false, isHost: id === 'a', score: 0 })),
    ...cambios,
  } as RoomSnapshot;
  const room = { state, error: null, online: true, offset: () => 0 } as unknown as RoomApi;
  return renderToStaticMarkup(<MemoryRouter><Sala room={room} code="ABC123" /></MemoryRouter>);
};

describe('formato de los juegos', () => {
  it('cada juego (y el desafío del día) tiene su "Cómo jugar" con pasos', () => {
    for (const juego of [...MULTI_GAMES, 'trivia_diaria']) {
      const pasos = COMO_JUGAR[juego];
      expect(pasos?.length, juego).toBeGreaterThanOrEqual(3);
      for (const p of pasos) expect(p.titulo && p.texto && p.color, juego).toBeTruthy();
    }
  });

  it('el menú de cada juego tiene el "?" y las filas de siempre', () => {
    for (const juego of ['tutti_frutti', 'ahorcado', 'trivia', 'sopa_de_letras', 'memotest']) {
      const html = en(`/juego/${juego}`, '/juego/:game', <GameMenu />);
      expect(html, juego).toContain('aria-label="Cómo jugar"');
      expect(html, juego).toContain('class="ui-fila"');
      expect(html, juego).toContain('data-testid="modo-solo"');
      expect(html, juego).toContain('data-testid="modo-crear-sala"');
    }
  });

  it('crear sala: las opciones son filas y "Crear sala" va en la barra fija, después del espacio', () => {
    const html = en('/juego/sopa_de_letras/crear-sala', '/juego/:game/crear-sala', <CreateRoom />);
    expect(html).toContain('data-testid="ajuste-tematica"');
    expect(html).toContain('data-testid="ajuste-dificultad"');
    expect(html).toMatch(/data-testid="ui-espacio-barra"[\s\S]*data-testid="ui-barra"[\s\S]*data-testid="crear-sala"/);
  });

  it('Tutti Frutti solo: "¡Jugar!" abajo, apagado y con el aviso hasta elegir temática y dificultad', () => {
    const html = en('/game-setup', '/game-setup', <GameSetup />);
    expect(html).toMatch(/data-testid="ui-barra"[\s\S]*Elegí la temática y la dificultad\.[\s\S]*data-testid="jugar-solo"[^>]*disabled/);
    expect(html).toContain('Elegí'); // las filas sin elegir
  });

  it('sala de espera: el anfitrión cambia las opciones y tiene "¡Jugar!" abajo; los demás sólo las ven', () => {
    const anfitrion = sala('a');
    expect(anfitrion).toContain('aria-label="Cómo jugar"');
    expect(anfitrion).toMatch(/data-testid="ui-barra"[\s\S]*data-testid="arrancar"/);
    expect(anfitrion).toMatch(/<button[^>]*data-testid="ajuste-rondas"/);

    const invitado = sala('b');
    expect(invitado).not.toContain('data-testid="arrancar"');
    expect(invitado).toContain('Esperando al anfitrión…');
    expect(invitado).toMatch(/<div[^>]*data-testid="ajuste-rondas"/); // sin botón: no se puede cambiar
    expect(invitado).toContain('Sólo el anfitrión cambia la configuración.');
  });

  it('en la partida del Impostor el "?" lo pone su pantalla (no hay dos)', () => {
    const view = {
      kind: 'impostor', numero: 1, total: 3, tematica: 'mezcla', segundosTurno: 30, maxPista: 30, etapa: 'pistas', categoria: 'Jugador', rol: 'grupo',
      palabra: 'Riquelme', orden: ['a', 'b'], turno: 'b', turnoHasta: Date.now() + 20_000, vuelta: 1, vueltas: 2, pistas: [], hasta: null, votaron: [],
      miVoto: null, descubierto: null, revelada: null,
    } satisfies ImpostorView;
    const html = sala('a', { game: 'impostor', phase: 'playing', view, settings: { tematica: 'mezcla', rounds: 3, seconds: 30 } });
    expect(html.match(/aria-label="Cómo jugar"/g)).toHaveLength(1);
    expect(sala('a', { game: 'impostor' }).match(/aria-label="Cómo jugar"/g)).toHaveLength(1); // en el lobby lo pone la sala
  });

  it('un ajuste muestra lo elegido (o "Elegí") y sin poder cambiarlo no es un botón', () => {
    const opciones = [{ id: 'a', label: 'Uno' }, { id: 'b', label: 'Dos' }];
    expect(renderToStaticMarkup(<AjusteElegible icono={Shapes} titulo="Tema" opciones={opciones} valor="b" onElegir={() => {}} />)).toMatch(/<button[\s\S]*Tema[\s\S]*Dos/);
    expect(renderToStaticMarkup(<AjusteElegible icono={Shapes} titulo="Tema" opciones={opciones} valor="" onElegir={() => {}} />)).toContain('Elegí');
    expect(renderToStaticMarkup(<AjusteElegible icono={Shapes} titulo="Tema" opciones={opciones} valor="a" deshabilitado onElegir={() => {}} />)).not.toContain('<button');
  });
});
