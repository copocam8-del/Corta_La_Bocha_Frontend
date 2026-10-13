import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, Clock, Copy, Crown, Gauge, Globe, Hash, LogOut, Play, Users } from 'lucide-react';
import MultiShell from '../multi/MultiShell';
import { useRoom, type RoomApi } from '../multi/useRoom';
import type { Phase, RoomSnapshot } from '../multi/types';
import BackButton from '../components/BackButton';
import { Avatar } from '../profile/avatars';
import { ABANDONAR } from '../components/abandonar';
import { gameName } from '../games/gameIcons';
import { menuPath, MULTI_CONFIG, publicaPath, tiempoLabel } from '../games/multiConfig';
import GameMulti from './GameMulti';
import TriviaMulti from '../multi/juegos/TriviaMulti';
import AhorcadoMulti from '../multi/juegos/AhorcadoMulti';
import SopaMulti from '../multi/juegos/SopaMulti';
import MemotestMulti from '../multi/juegos/MemotestMulti';
import { usePantallaMemotest } from '../games/usePantallaMemotest';
import { MESA_PC } from '../api/memotest';

// Sala multijugador de cualquier juego (/room/:code). Muestra el lobby o la partida según lo que
// diga el servidor: si recargás la página en medio de una ronda, volvés exactamente a donde estabas.

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
    navigate(menuPath(state.game));
  };

  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: '4px' }}>
        <p className="kicker">{state.isPrivate ? 'Sala privada' : 'Partida pública'} · {gameName(state.game)}</p>
        <h1 className="neon-title" style={{ fontSize: '26px', marginTop: '6px' }}>Sala de espera</h1>
        {state.isPrivate && (
          <button onClick={copy} data-testid="codigo-sala" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '10px', padding: '6px 14px',
            border: '1px solid rgba(57,255,140,0.3)', borderRadius: '20px', background: 'rgba(57,255,140,0.05)', cursor: 'pointer',
          }}>
            <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '16px', fontWeight: 700, color: '#39ff8c', letterSpacing: '4px' }}>
              {state.code}
            </span>
            {copied ? <Check size={14} color="#39ff8c" /> : <Copy size={14} color="rgba(124,255,178,0.5)" />}
          </button>
        )}
      </div>

      <div className="card pulse">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <p className="section-label" style={{ marginBottom: 0 }}>
            <Users size={12} /> Jugadores ({active.length}/{state.maxPlayers})
          </p>
          {!canStart && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: 'rgba(124,255,178,0.5)', textTransform: 'uppercase' }}>
              <span className="waiting-dot" /> Esperando…
            </span>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} data-testid="jugadores">
          {active.map((p, i) => (
            <div key={p.userId} className="player-row" style={{ animationDelay: `${i * 0.05}s`, opacity: p.connected ? 1 : 0.5 }}>
              <Avatar id={p.avatarId} fallback={p.username} size={36} />
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '14px', fontWeight: 600 }}>
                  {p.userId === state.me ? `${p.username} (vos)` : p.username}
                </span>
                {p.isHost && <Crown size={12} color="#fbbf24" aria-label="Anfitrión" />}
              </div>
              <span className="dot" title={p.connected ? 'Conectado' : 'Desconectado'} style={{ background: p.connected ? '#39ff8c' : '#f87171' }} />
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {config.tematicas && (
          <div>
            <p className="section-label"><Globe size={11} /> {config.tematicas.titulo}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {config.tematicas.opciones.map((t) => (
                <button key={t.id} className={`option-btn${state.settings.tematica === t.id ? ' active' : ''}`} style={{ flex: 'none' }}
                  disabled={!isHost} onClick={() => void room.updateSettings({ tematica: t.id })}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}
        {config.dificultades && (
          <div>
            <p className="section-label"><Gauge size={11} /> Dificultad</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {config.dificultades.map((d) => (
                <button key={d.id} className={`option-btn${state.settings.dificultad === d.id ? ' active' : ''}`}
                  disabled={!isHost} onClick={() => void room.updateSettings({ dificultad: d.id })}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )}
        <div>
          <p className="section-label"><Hash size={11} /> {config.rondas.titulo}</p>
          <div style={{ display: 'flex', gap: '6px' }}>
            {config.rondas.opciones.map((r) => (
              <button key={r} className={`option-btn${state.settings.rounds === r ? ' active' : ''}`}
                disabled={!isHost} onClick={() => void room.updateSettings({ rounds: r })}>
                {r}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="section-label"><Clock size={11} /> {config.tiempos.titulo}</p>
          <div style={{ display: 'flex', gap: '6px' }}>
            {config.tiempos.opciones.map((t) => (
              <button key={t} className={`option-btn${state.settings.seconds === t ? ' active' : ''}`}
                disabled={!isHost} onClick={() => void room.updateSettings({ seconds: t })}>
                {tiempoLabel(t)}
              </button>
            ))}
          </div>
        </div>
        {!isHost && (
          <p style={{ fontSize: '11px', color: 'rgba(180,255,205,0.5)' }}>Sólo el anfitrión cambia la configuración.</p>
        )}
      </div>

      {state.notice && <div className="notice">{state.notice}</div>}
      {room.error && <div className="error">{room.error}</div>}

      {!state.isPrivate ? (
        <div className="card" style={{ textAlign: 'center', padding: '14px' }}>
          <span style={{ fontSize: '13px', color: 'rgba(124,255,178,0.7)' }}>La partida arranca sola cuando entran todos…</span>
        </div>
      ) : isHost ? (
        <button className="main-btn" data-testid="arrancar" disabled={!canStart} onClick={() => void room.start()}>
          <Play size={18} />
          {canStart ? '¡Jugar!' : `Esperando jugadores (${connected}/${state.minPlayers} mín)`}
        </button>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span className="waiting-dot" />
          <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '13px', color: 'rgba(124,255,178,0.6)', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Esperando al anfitrión…
          </span>
        </div>
      )}
      <button className="ghost-btn" onClick={() => void salir()}>
        <LogOut size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> Salir de la sala
      </button>
    </>
  );
}

export default function Room() {
  const navigate = useNavigate();
  const { code = '' } = useParams<{ code: string }>();
  const room = useRoom(code.toUpperCase());
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
        <p style={{ fontSize: '13px', color: 'rgba(180,255,205,0.7)' }}>Entrando a la sala {code.toUpperCase()}…</p>
      </div>
    );
  } else if (state.phase === 'closed') {
    content = (
      <div className="card" style={{ textAlign: 'center' }}>
        <p className="notice">{state.notice ?? 'La sala se cerró.'}</p>
        <button className="main-btn" style={{ marginTop: '12px' }} onClick={() => navigate(state.isPrivate ? menuPath(state.game) : publicaPath(state.game))}>
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
  } else {
    content = <GameMulti room={room} state={state} />;
  }

  // Volver: lobby → menú del juego; en partida pregunta antes (abandonar cuenta como perdida y se
  // les avisa a los demás); al final, sale sin preguntar.
  const meLeft = state?.players.find((p) => p.userId === state.me)?.left ?? false;
  const enPartida = !!state && EN_PARTIDA.includes(state.phase) && !meLeft;
  const back = (
    <BackButton
      to={state ? menuPath(state.game) : '/dashboard'}
      confirm={enPartida ? ABANDONAR : null}
      onLeave={() => (state ? room.leave() : undefined)}
    />
  );

  // El memotest en la PC usa una mesa más ancha (tablero horizontal, ver usePantallaMemotest)
  const ancho = !state || state.phase === 'lobby' ? 480 : state.game === 'memotest' && state.phase !== 'finished' && pantalla.orientacion === 'horizontal' ? MESA_PC : 720;
  return <MultiShell maxWidth={ancho}>{back}{content}</MultiShell>;
}
