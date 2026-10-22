import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ImpostorMulti from './juegos/ImpostorMulti';
import GameMenu from '../pages/GameMenu';
import { MULTI_CONFIG } from '../games/multiConfig';
import { achievementIcon } from '../profile/achievementIcons';
import { Award } from 'lucide-react';
import type { RoomApi } from './useRoom';
import type { RoomSnapshot } from './types';
import type { ImpostorView } from './gameViews';

// El Impostor: el menú (sin modo solo), las opciones (copia del backend) y lo que ve cada uno.

const room = { offset: () => 0, online: true, error: null, action: async () => ({ ok: true }) } as unknown as RoomApi;

const jugadores = ['a', 'b', 'c'].map((id, i) => ({
  userId: id, username: ['Ana', 'Beto', 'Caro'][i], avatarId: null, connected: true, left: false, isHost: id === 'a', score: 0,
}));

const vista = (cambios: Partial<ImpostorView>): ImpostorView => ({
  kind: 'impostor', numero: 1, total: 3, tematica: 'mezcla', segundosTurno: 30, maxPista: 30,
  etapa: 'pistas', categoria: 'Jugador', rol: 'grupo', palabra: 'Riquelme',
  orden: ['b', 'a', 'c'], turno: 'b', turnoHasta: Date.now() + 20_000, vuelta: 1, vueltas: 2,
  pistas: [], hasta: null, votaron: [], miVoto: null, descubierto: null, revelada: null,
  ...cambios,
});

const pantalla = (me: string, v: ImpostorView, phase: RoomSnapshot['phase'] = 'playing') =>
  renderToStaticMarkup(
    <MemoryRouter>
      <ImpostorMulti room={room} state={{
        code: 'ABC123', game: 'impostor', isPrivate: true, me, hostUserId: 'a', phase, settings: { tematica: 'mezcla', rounds: 3, seconds: 30 },
        minPlayers: 3, maxPlayers: 8, serverNow: Date.now(), players: jugadores, round: null, nextAt: Date.now() + 8000,
        lastResult: null, history: [], view: v, final: null, notice: null,
      } as RoomSnapshot} />
    </MemoryRouter>,
  );

describe('El Impostor: menú y opciones', () => {
  it('el menú online no tiene "Solo": sólo con amigos y partida pública', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/juego/impostor/online']}>
        <Routes><Route path="/juego/:game/online" element={<GameMenu online />} /></Routes>
      </MemoryRouter>,
    );
    expect(html).toContain('El Impostor');
    expect(html).not.toContain('data-testid="modo-solo"');
    expect(html).toContain('Crear sala privada');
    expect(html).toContain('Unirse con código');
    expect(html).toContain('Partida pública');
  });

  it('de 3 a 8 jugadores; en la pública, pocos = 3 a 4; tiene explicación para el lobby', () => {
    const c = MULTI_CONFIG.impostor;
    expect([c.minPlayers, c.maxPlayers]).toEqual([3, 8]);
    expect(c.publica.rangos).toEqual({ pocos: '3 a 4 jugadores', muchos: '5 a 8 jugadores' });
    expect(c.explicacion?.length).toBeGreaterThan(0);
  });

  // Si el backend está al lado (como en la compu del equipo), las opciones tienen que ser las mismas
  const back = Object.values(import.meta.glob('../../../Corta_La_Bocha_Backend/src/rooms/modes/impostor.mode.ts', { query: '?raw', import: 'default', eager: true }))[0] as string | undefined;
  const reglas = Object.values(import.meta.glob('../../../Corta_La_Bocha_Backend/src/impostor/impostor-rules.ts', { query: '?raw', import: 'default', eager: true }))[0] as string | undefined;
  it.skipIf(!back || !reglas)('las opciones son una copia de las del backend', () => {
    const lista = (texto: string, nombre: string) => texto.match(new RegExp(`${nombre}[^=]*= \\[([^\\]]*)\\]`))![1].split(',').map((x) => x.trim().replace(/'/g, ''));
    const c = MULTI_CONFIG.impostor;
    expect(c.rondas.opciones.map(String)).toEqual(lista(back!, 'IMPOSTOR_RONDAS'));
    expect(c.tiempos.opciones.map(String)).toEqual(lista(back!, 'IMPOSTOR_SEGUNDOS'));
    expect(c.tematicas!.opciones.map((o) => o.id).sort()).toEqual(lista(reglas!, 'TEMATICAS_IMPOSTOR').sort());
    expect(back).toContain(`IMPOSTOR_MIN_JUGADORES = ${c.minPlayers}`);
  });

  it('los logros del Impostor tienen su ícono', () => {
    for (const id of ['impostor_multi', 'impostor_invisible', 'impostor_detective']) expect(achievementIcon(id)).not.toBe(Award);
  });
});

describe('El Impostor: lo que ve cada uno', () => {
  it('el grupo ve la palabra bien grande; el impostor ve "Sos el impostor" y sólo la categoría', () => {
    const grupo = pantalla('a', vista({}));
    expect(grupo).toContain('Riquelme');
    expect(grupo).not.toContain('Sos el impostor');
    const impostor = pantalla('c', vista({ rol: 'impostor', palabra: null }));
    expect(impostor).toContain('Sos el impostor');
    expect(impostor).toContain('Jugador');
    expect(impostor).not.toContain('Riquelme');
  });

  it('pistas: muestra las de cada uno, a quién le toca y el campo sólo al del turno', () => {
    const v = vista({ pistas: [{ userId: 'b', vuelta: 1, texto: 'enganche' }, { userId: 'a', vuelta: 1, texto: null }], turno: 'c' });
    const html = pantalla('c', v);
    expect(html).toContain('enganche');
    expect(html).toContain('sin pista');
    expect(html).toContain('¡Te toca dar una pista!');
    expect(html).toContain('maxLength="30"');
    expect(pantalla('a', v)).not.toContain('id="imp-pista"');
    expect(pantalla('a', v)).toContain('Pista de');
  });

  it('votación: un botón por cada uno de los otros (nunca a uno mismo)', () => {
    const html = pantalla('a', vista({ etapa: 'votacion', turno: null, hasta: Date.now() + 30_000, votaron: ['b'] }));
    expect(html).toContain('¡A votar!');
    const botones = html.match(/class="imp-voto[^"]*"/g) ?? [];
    expect(botones).toHaveLength(2);
    expect(html).toContain('Beto');
    expect(html).toContain('Caro');
  });

  it('si lo descubren, sólo el impostor puede adivinar', () => {
    const v = vista({ etapa: 'adivinanza', turno: null, hasta: Date.now() + 20_000, descubierto: 'c' });
    expect(pantalla('c', { ...v, rol: 'impostor', palabra: null })).toContain('¡Te descubrieron!');
    const grupo = pantalla('a', v);
    expect(grupo).toContain('era el impostor');
    expect(grupo).not.toContain('¡Te descubrieron!');
  });

  it('revelación: quién era, la palabra, los votos y los puntos', () => {
    const html = pantalla('a', vista({
      etapa: null,
      revelada: {
        numero: 1, palabra: 'Riquelme', categoria: 'Jugador', impostor: 'c', votos: [{ de: 'a', a: 'c' }, { de: 'b', a: 'a' }],
        acusado: null, adivinanza: null, acerto: null, ganador: 'impostor', motivo: 'zafo', puntos: { c: 30 },
      },
    }), 'results');
    expect(html).toContain('El impostor era');
    expect(html).toContain('Caro');
    expect(html).toContain('Riquelme');
    expect(html).toContain('el impostor zafó');
    expect(html).toContain('Perdiste la ronda.');
    expect(html).toContain('Caro +30');
  });
});
