import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, Copy, Crown, LogOut, Play, Users } from 'lucide-react';
import MultiShell from '../multi/MultiShell';
import { useRoom, type RoomApi } from '../multi/useRoom';
import type { Phase, RoomSnapshot } from '../multi/types';
import BackButton from '../components/BackButton';
import { Avatar } from '../profile/avatars';
import { ABANDONAR } from '../components/abandonar';
import { gameIcon, gameName } from '../games/gameIcons';
import { menuOnlinePath, MULTI_CONFIG, publicaPath } from '../games/multiConfig';
import { comoJugarDe } from '../games/comoJugar';
import { BarraAbajo, BotonAyuda, Encabezado, EstilosJuego } from '../games/ui/JuegoUI';
import AjustesSala from '../multi/AjustesSala';
import GameMulti from './GameMulti';
import TriviaMulti from '../multi/juegos/TriviaMulti';
import AhorcadoMulti from '../multi/juegos/AhorcadoMulti';
import SopaMulti from '../multi/juegos/SopaMulti';
import MemotestMulti from '../multi/juegos/MemotestMulti';
import ImpostorMulti from '../multi/juegos/ImpostorMulti';
import { usePantallaMemotest } from '../games/usePantallaMemotest';
import { MESA_PC } from '../api/memotest';

// Sala multijugador de cualquier juego (/room/:code). Muestra el lobby o la partida según lo que
// diga el servidor: si recargás la página en medio de una ronda, volvés exactamente a donde estabas.

// Juegos que ya tienen el formato de El Impostor en la partida (los demás todavía usan la columna ancha)
const COLUMNA_480: string[] = ['impostor', 'tutti_frutti', 'ahorcado', 'trivia', 'sopa_de_letras'];

const EN_PARTIDA: Phase[] = ['countdown', 'playing', 'collecting', 'validating', 'results'];

function Lobby({ room, state }: { room: RoomApi; state: RoomSnapshot }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const isHost = state.hostUserId === state.me;
  const active = state.players.filter((p) => !p.left);
  const connected = active.filter((p) => p.connected).length;
  const canStart = connected >= state.minPlayers;

  const copy = () => {
    void navigator.clipboard?.writeText(state.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const config = MULTI_CONFIG[state.game] ?? MULTI_CONFIG.tutti_frutti;

  const salir = async () => {
    await room.leave();
    navigate(menuOnlinePath(state.game));
  };

  // Abajo, fijo: "¡Jugar!" (anfitrión de una sala privada) o en qué está la sala
  const barra = !state.isPrivate ? (
    <p className="ui-barra-nota">La partida arranca sola cuando entran todos…</p>
  ) : isHost ? (
    <>
      {!canStart && <p className="ui-barra-nota">Esperando jugadores ({connected}/{state.minPlayers} mín)</p>}
      <button className="ui-boton" data-testid="arrancar" disabled={!canStart} onClick={() => void room.start()}>
        <Play size={20} fill="currentColor" /> ¡Jugar!
      </button>
    </>
  ) : (
    <p className="ui-barra-nota" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
      <span className="waiting-dot" /> Esperando al anfitrión…
    </p>
  );

  return (
    <>
      <Encabezado
        icono={gameIcon(state.game)}
        kicker={`${state.isPrivate ? 'Sala privada' : 'Partida pública'} · ${gameName(state.game)}`}
        titulo="Sala de espera"
      />
      {state.isPrivate && (
        <button onClick={copy} data-testid="codigo-sala" aria-label={`Copiar el código ${state.code}`} className="ui-chico"
          style={{ alignSelf: 'center', padding: '0 18px', minHeight: '46px', borderRadius: '999px' }}>
          <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '20px', fontWeight: 700, color: '#39ff8c', letterSpacing: '5px' }}>
            {state.code}
          </span>
          {copied ? <Check size={16} color="#39ff8c" /> : <Copy size={16} color="rgba(124,255,178,0.7)" />}
        </button>
      )}

      <div className="card pulse ui-filas">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p className="kicker" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={13} /> Jugadores ({active.length}/{state.maxPlayers})
          </p>
          {!canStart && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'rgba(124,255,178,0.6)', textTransform: 'uppercase' }}>
              <span className="waiting-dot" /> Esperando…
            </span>
          )}
        </div>
        <ul className="ui-filas" data-testid="jugadores">
          {active.map((p) => (
            <li key={p.userId} className="ui-fila" style={{ opacity: p.connected ? 1 : 0.5 }}>
              <Avatar id={p.avatarId} fallback={p.username} size={38} />
              <span className="ui-fila-nombre" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {p.userId === state.me ? `${p.username} (vos)` : p.username}
                {p.isHost && <Crown size={14} color="#fbbf24" aria-label="Anfitrión" />}
              </span>
              <span className="dot" title={p.connected ? 'Conectado' : 'Desconectado'} style={{ background: p.connected ? '#39ff8c' : '#f87171', boxShadow: `0 0 8px ${p.connected ? '#39ff8c' : '#f87171'}` }} />
            </li>
          ))}
        </ul>
      </div>

      <div className="card ui-filas" data-testid="ajustes-sala">
        <p className="kicker">Configuración</p>
        <AjustesSala config={config} ajustes={state.settings} deshabilitado={!isHost} onCambiar={(c) => void room.updateSettings(c)} />
        {!isHost && <p className="ui-fila-sub" style={{ padding: '0 4px' }}>Sólo el anfitrión cambia la configuración.</p>}
      </div>

      {state.notice && <div className="notice">{state.notice}</div>}
      {room.error && <div className="error">{room.error}</div>}

      <button className="ghost-btn" onClick={() => void salir()}>
        <LogOut size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> Salir de la sala
      </button>
      <BarraAbajo>{barra}</BarraAbajo>
    </>
  );
}

export default function Room() {
  const { code = '' } = useParams<{ code: string }>();
  return <Sala room={useRoom(code.toUpperCase())} code={code.toUpperCase()} />;
}

// Lo que se ve de la sala según el estado que manda el servidor (separado de la conexión: así se puede mirar
// cada pantalla con un estado de ejemplo)
export function Sala({ room, code }: { room: RoomApi; code: string }) {
  const navigate = useNavigate();
  const { state, error } = room;
  const pantalla = usePantallaMemotest();

  let content;
  if (!state) {
    content = error ? (
      <div className="card" style={{ textAlign: 'center' }}>
        <div className="error" data-testid="error-sala">{error}</div>
        <button className="ghost-btn" style={{ marginTop: '12px' }} onClick={() => navigate('/dashboard')}>Volver a los juegos</button>
      </div>
    ) : (
      <div className="card" style={{ textAlign: 'center' }}>
        <div className="spinner" />
        <p style={{ fontSize: '13px', color: 'rgba(180,255,205,0.7)' }}>Entrando a la sala {code}…</p>
      </div>
    );
  } else if (state.phase === 'closed') {
    content = (
      <div className="card" style={{ textAlign: 'center' }}>
        <p className="notice">{state.notice ?? 'La sala se cerró.'}</p>
        <button className="ui-boton" style={{ marginTop: '12px' }} onClick={() => navigate(state.isPrivate ? menuOnlinePath(state.game) : publicaPath(state.game))}>
          {state.isPrivate ? 'Volver al menú' : 'Buscar otra partida'}
        </button>
      </div>
    );
  } else if (state.phase === 'lobby') {
    content = <Lobby room={room} state={state} />;
  } else if (state.game === 'trivia') {
    content = <TriviaMulti room={room} state={state} />;
  } else if (state.game === 'ahorcado') {
    content = <AhorcadoMulti room={room} state={state} />;
  } else if (state.game === 'sopa_de_letras') {
    content = <SopaMulti room={room} state={state} />;
  } else if (state.game === 'memotest') {
    content = <MemotestMulti room={room} state={state} />;
  } else if (state.game === 'impostor') {
    content = <ImpostorMulti room={room} state={state} />;
  } else {
    content = <GameMulti room={room} state={state} />;
  }

  // Volver: lobby → menú del juego; en partida pregunta antes (abandonar cuenta como perdida y se
  // les avisa a los demás); al final, sale sin preguntar.
  const meLeft = state?.players.find((p) => p.userId === state.me)?.left ?? false;
  const enPartida = !!state && EN_PARTIDA.includes(state.phase) && !meLeft;
  const back = (
    <BackButton
      to={state ? menuOnlinePath(state.game) : '/dashboard'}
      confirm={enPartida ? ABANDONAR : null}
      onLeave={() => (state ? room.leave() : undefined)}
    />
  );

  // Columna de 480 px (los tableros más anchos van en un .ui-ancho). El memotest en la PC usa una mesa más ancha
  // (tablero horizontal, ver usePantallaMemotest)
  const ancho = !state || state.phase === 'lobby' || COLUMNA_480.includes(state.game) ? 480 : state.game === 'memotest' && state.phase !== 'finished' && pantalla.orientacion === 'horizontal' ? MESA_PC : 720;
  // "?" con Cómo jugar de cada juego (en la partida del Impostor lo pone su propia pantalla)
  const ayuda = state && !(state.game === 'impostor' && state.phase !== 'lobby' && state.phase !== 'closed') ? comoJugarDe(state.game) : undefined;
  return (
    <MultiShell maxWidth={ancho}>
      <EstilosJuego />
      {back}
      {ayuda && <BotonAyuda pasos={ayuda} />}
      {content}
    </MultiShell>
  );
}
