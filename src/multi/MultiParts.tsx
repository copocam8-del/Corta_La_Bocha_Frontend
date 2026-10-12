import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Users, WifiOff } from 'lucide-react';
import type { RoomApi } from './useRoom';
import type { RoomSnapshot } from './types';
import { Standings } from './MultiRoundResults';
import { rondaLabel } from './players';
import { Avatar } from '../profile/avatars';
import { secondsUntil } from './clock';
import { achievementIcon } from '../profile/achievementIcons';
import { gameName } from '../games/gameIcons';
import { menuPath, publicaPath } from '../games/multiConfig';
import AdSlot from '../ads/AdSlot';

// Partes comunes de las partidas multijugador de todos los juegos: encabezado, marcador, cuenta
// regresiva y pantalla final (posiciones, logros y "jugar otra vez").

export function Scoreboard({ state, extra }: { state: RoomSnapshot; extra?: (userId: string) => ReactNode }) {
  const players = [...state.players].sort((a, b) => b.score - a.score);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }} data-testid="marcador">
      {players.map((p) => (
        <span key={p.userId} style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '999px',
          border: `1px solid ${p.userId === state.me ? 'rgba(57,255,140,0.6)' : 'rgba(57,255,140,0.2)'}`,
          background: 'rgba(4,20,11,0.6)', fontSize: '12px', opacity: p.left ? 0.4 : 1,
        }}>
          <span className="dot" style={{ background: p.connected ? '#39ff8c' : '#f87171', width: 6, height: 6 }} />
          <Avatar id={p.avatarId} fallback={p.username} size={20} />
          {p.userId === state.me ? 'Vos' : p.username}
          <strong style={{ color: '#39ff8c', fontFamily: "'Oswald', sans-serif" }}>{p.score}</strong>
          {extra?.(p.userId)}
        </span>
      ))}
    </div>
  );
}

export function MultiHeader({ room, state, detail, right }: { room: RoomApi; state: RoomSnapshot; detail?: ReactNode; right?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
      <div>
        <p className="kicker">{state.isPrivate ? `Sala ${state.code}` : 'Partida pública'} · {detail ?? gameName(state.game)}</p>
        {state.view && (
          <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>
            {rondaLabel(state)} {state.view.numero} de {state.view.total}
          </p>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {!room.online && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#fca5a5', fontSize: '12px' }}>
            <WifiOff size={14} /> Reconectando…
          </span>
        )}
        {right}
      </div>
    </div>
  );
}

export function Countdown({ state, now, offset }: { state: RoomSnapshot; now: number; offset: number }) {
  return (
    <div className="card pulse" style={{ textAlign: 'center', padding: '40px 20px' }} data-testid="cuenta-regresiva">
      {state.view && <p className="kicker">{rondaLabel(state)} {state.view.numero} de {state.view.total}</p>}
      <h1 className="neon-title" style={{ fontSize: '30px', margin: '10px 0' }}>¡Preparados!</h1>
      <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: '48px', color: '#39ff8c' }}>{secondsUntil(state.nextAt, offset, now)}</p>
    </div>
  );
}

export function Notices({ room, state, local }: { room: RoomApi; state: RoomSnapshot; local?: string | null }) {
  return (
    <>
      {local && <div className="error" role="status">{local}</div>}
      {room.error && <div className="error">{room.error}</div>}
      {state.notice && <div className="notice">{state.notice}</div>}
    </>
  );
}

// Pantalla final: ganador, posiciones, logros nuevos y qué hacer después
export function MultiFinal({ room, state, children }: { room: RoomApi; state: RoomSnapshot; children?: ReactNode }) {
  const navigate = useNavigate();
  if (!state.final) return null;
  const meStanding = state.final.standings.find((s) => s.userId === state.me);
  const winners = state.final.standings.filter((s) => s.won);
  const isHost = state.hostUserId === state.me;
  return (
    <>
      <div className="card pulse" style={{ textAlign: 'center' }} data-testid="final">
        <Trophy size={28} color="#fbbf24" />
        <h1 className="neon-title" style={{ fontSize: '26px', margin: '6px 0' }}>
          {meStanding?.won ? '¡Ganaste!' : winners.length ? `Ganó ${winners.map((w) => w.username).join(' y ')}` : 'Terminó la partida'}
        </h1>
        {state.notice && <p style={{ fontSize: '12px', color: '#fde68a', marginBottom: '8px' }}>{state.notice}</p>}
        <Standings standings={state.final.standings} me={state.me} />
        {!state.final.countsForStats && (
          <div className="notice" style={{ marginTop: '12px', textAlign: 'left' }}>
            Esta partida no cuenta para las estadísticas ni el ranking
            {state.game !== 'tutti_frutti' || state.history.length === 0
              ? ' (no se llegó a jugar ninguna ronda).'
              : ' (la IA no pudo validar algunas respuestas).'}
          </div>
        )}
        {state.final.newAchievements.length > 0 && (
          <div role="status" style={{
            marginTop: '12px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.45)',
          }}>
            <p className="kicker" style={{ color: '#fde047' }}>
              {state.final.newAchievements.length === 1 ? '¡Logro desbloqueado!' : '¡Logros desbloqueados!'}
            </p>
            {state.final.newAchievements.map((a) => {
              const Icon = achievementIcon(a.id);
              return (
                <p key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', color: '#fef9c3' }}>
                  <Icon size={15} color="#fde047" /> <strong>{a.name}</strong> · {a.description}
                </p>
              );
            })}
          </div>
        )}
      </div>

      {children}

      {state.isPrivate ? (
        isHost ? (
          <button className="main-btn" data-testid="jugar-otra-vez" onClick={() => void room.playAgain()}>
            <Users size={18} /> Jugar otra vez
          </button>
        ) : (
          <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(180,255,205,0.6)' }}>
            Esperando a que el anfitrión arranque otra…
          </p>
        )
      ) : (
        <button className="main-btn" onClick={() => { void room.leave(); navigate(publicaPath(state.game)); }}>
          Buscar otra partida
        </button>
      )}
      <button className="ghost-btn" onClick={() => { void room.leave(); navigate(menuPath(state.game)); }}>Volver al menú</button>
      <AdSlot placement="resultado" />
    </>
  );
}
