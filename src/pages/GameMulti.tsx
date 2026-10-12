import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StopCircle, Timer, Trophy, Users, WifiOff } from 'lucide-react';
import type { RoomApi } from '../multi/useRoom';
import type { RoomSnapshot } from '../multi/types';
import { temaLabel } from '../multi/types';
import { secondsUntil } from '../multi/clock';
import { useNow } from '../multi/useNow';
import { MultiRoundResults, Standings } from '../multi/MultiRoundResults';
import { missingCategories } from '../game/round';
import { achievementIcon } from '../profile/achievementIcons';

// Partida multijugador en curso. Todo lo decide el servidor (letra, reloj, ¡Basta!, validación y
// puntaje); acá se muestra el estado y se mandan las respuestas mientras el jugador escribe.

const SEND_DEBOUNCE_MS = 350;

function Scoreboard({ state }: { state: RoomSnapshot }) {
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
          {p.userId === state.me ? 'Vos' : p.username}
          <strong style={{ color: '#39ff8c', fontFamily: "'Oswald', sans-serif" }}>{p.score}</strong>
        </span>
      ))}
    </div>
  );
}

export default function GameMulti({ room, state }: { room: RoomApi; state: RoomSnapshot }) {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const roundRef = useRef<number | null>(null);
  const finalSentRef = useRef<number | null>(null);
  const sendTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const answersRef = useRef<Record<string, string>>({});

  const round = state.round;
  const phase = state.phase;
  const now = useNow(phase === 'countdown' || phase === 'playing' || phase === 'results');
  const offset = room.offset();

  // Ronda nueva (o volvimos después de recargar): arrancamos con lo que el servidor tiene guardado
  useEffect(() => {
    if (!round) return;
    if (roundRef.current !== round.number) {
      roundRef.current = round.number;
      answersRef.current = round.myAnswers ?? {};
      setAnswers(answersRef.current);
    }
  }, [round]);

  // Al cortarse la ronda (¡Basta! o tiempo), mandamos las respuestas finales una sola vez
  useEffect(() => {
    if (phase === 'collecting' && round && finalSentRef.current !== round.number) {
      finalSentRef.current = round.number;
      if (sendTimer.current) clearTimeout(sendTimer.current);
      void room.sendAnswers(answersRef.current, true);
    }
  }, [phase, round, room]);

  const handleChange = (cat: string, value: string) => {
    if (phase !== 'playing') return;
    const next = { ...answersRef.current, [cat]: value };
    answersRef.current = next;
    setAnswers(next);
    if (sendTimer.current) clearTimeout(sendTimer.current);
    sendTimer.current = setTimeout(() => void room.sendAnswers(next), SEND_DEBOUNCE_MS);
  };

  const faltan = round ? missingCategories(round.categories, answers).length : 0;
  const handleBasta = () => {
    if (faltan > 0) return;
    if (sendTimer.current) clearTimeout(sendTimer.current);
    void room.basta(answersRef.current);
  };

  const handleSalir = async () => {
    await room.leave();
    navigate('/lobby');
  };

  const header = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
      <div>
        <p className="kicker">{state.isPrivate ? `Sala ${state.code}` : 'Partida pública'} · {temaLabel(state.settings.tematica)}</p>
        {round && <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '2px' }}>Ronda {round.number} de {round.total}</p>}
      </div>
      {!room.online && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#fca5a5', fontSize: '12px' }}>
          <WifiOff size={14} /> Reconectando…
        </span>
      )}
    </div>
  );

  // ── Cuenta regresiva ──────────────────────────────────────────────────────────────────────
  if (phase === 'countdown' && round) {
    return (
      <>
        {header}
        <div className="card pulse" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p className="kicker">Ronda {round.number} de {round.total}</p>
          <h1 className="neon-title" style={{ fontSize: '30px', margin: '10px 0' }}>¡Preparados!</h1>
          <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: '48px', color: '#39ff8c' }}>{secondsUntil(state.nextAt, offset, now)}</p>
        </div>
        <Scoreboard state={state} />
      </>
    );
  }

  // ── Jugando / cortando / validando ────────────────────────────────────────────────────────
  if ((phase === 'playing' || phase === 'collecting' || phase === 'validating') && round) {
    const left = phase === 'playing' ? secondsUntil(round.endsAt, offset, now) : 0;
    const color = left > 30 ? '#39ff8c' : left > 10 ? '#fbbf24' : '#ef4444';
    const cortada = phase !== 'playing';
    return (
      <>
        {header}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{
            width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(4,20,11,0.85)', border: '2px solid rgba(57,255,140,0.55)', borderRadius: '12px',
            animation: 'letterPop 0.6s cubic-bezier(0.34,1.56,0.64,1) both',
          }}>
            <span data-testid="letra" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '44px', fontWeight: 700, textShadow: '0 0 20px rgba(57,255,140,0.8)' }}>
              {round.letter}
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '10px', letterSpacing: '2px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Tiempo</p>
            <p data-testid="reloj" style={{
              fontFamily: "'Oswald', sans-serif", fontSize: '40px', fontWeight: 700, lineHeight: 1, color,
              textShadow: `0 0 18px ${color}`, animation: !cortada && left <= 10 ? 'timerWarn 0.5s ease infinite' : 'none',
            }}>{left}</p>
          </div>
        </div>

        {cortada && (
          <div data-testid="fin-de-ronda" className="card" style={{ textAlign: 'center', padding: '14px' }}>
            <p style={{
              fontFamily: "'Oswald', sans-serif", fontSize: '20px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            }}>
              {round.bastaBy ? <><StopCircle size={20} color="#39ff8c" /> ¡Basta! ({round.bastaBy === state.players.find((p) => p.userId === state.me)?.username ? 'vos' : round.bastaBy})</>
                : <><Timer size={20} color="#39ff8c" /> ¡Tiempo!</>}
            </p>
            <div className="spinner" />
            <p style={{ fontSize: '12px', color: 'rgba(180,255,205,0.7)' }}>
              {phase === 'validating' ? 'La IA está validando las respuestas de todos…' : 'Juntando las respuestas…'}
            </p>
          </div>
        )}

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {round.categories.map((cat) => (
            <label key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span className="section-label" style={{ marginBottom: 0 }}>{cat}</span>
              <input
                className="grid-input"
                data-categoria={cat}
                placeholder={`${round.letter ?? ''}...`}
                value={answers[cat] ?? ''}
                maxLength={150}
                disabled={cortada}
                onChange={(e) => handleChange(cat, e.target.value)}
              />
            </label>
          ))}
        </div>

        {!cortada && (
          <>
            <button className="main-btn" data-testid="basta" onClick={handleBasta} disabled={faltan > 0}>
              <StopCircle size={18} /> ¡Basta!
            </button>
            {faltan > 0 && (
              <p style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(180,255,205,0.55)', marginTop: '-4px' }}>
                Para cantar ¡Basta! completá todas las categorías ({faltan === 1 ? 'falta 1' : `faltan ${faltan}`}).
              </p>
            )}
          </>
        )}
        {room.error && <div className="error">{room.error}</div>}
        {state.notice && <div className="notice">{state.notice}</div>}
        <Scoreboard state={state} />
      </>
    );
  }

  // ── Resultados de la ronda ────────────────────────────────────────────────────────────────
  if (phase === 'results' && state.lastResult) {
    return (
      <>
        {header}
        <div className="card">
          <p className="kicker">Ronda {state.lastResult.number} · Letra {state.lastResult.letter}</p>
          <p style={{ fontSize: '12px', color: 'rgba(180,255,205,0.7)', margin: '4px 0 10px' }}>
            {state.lastResult.bastaBy ? `¡Basta! de ${state.lastResult.bastaBy}` : 'Se terminó el tiempo'} · Próxima ronda en{' '}
            <strong>{secondsUntil(state.nextAt, offset, now)} s</strong>
          </p>
          <MultiRoundResults result={state.lastResult} me={state.me} />
        </div>
        {state.notice && <div className="notice">{state.notice}</div>}
        <Scoreboard state={state} />
      </>
    );
  }

  // ── Final ─────────────────────────────────────────────────────────────────────────────────
  if (phase === 'finished' && state.final) {
    const meStanding = state.final.standings.find((s) => s.userId === state.me);
    const winners = state.final.standings.filter((s) => s.won);
    const isHost = state.hostUserId === state.me;
    return (
      <>
        {header}
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
              {state.history.length === 0 ? ' (no se llegó a jugar ninguna ronda).' : ' (la IA no pudo validar algunas respuestas).'}
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

        {state.history.length > 0 && (
          <details className="card">
            <summary style={{ cursor: 'pointer', fontFamily: "'Oswald', sans-serif", letterSpacing: '2px', textTransform: 'uppercase', fontSize: '12px' }}>
              Ver todas las rondas
            </summary>
            {state.history.map((r) => (
              <div key={r.number} style={{ marginTop: '10px' }}>
                <p className="kicker">Ronda {r.number} · Letra {r.letter}</p>
                <MultiRoundResults result={r} me={state.me} />
              </div>
            ))}
          </details>
        )}

        {state.isPrivate ? (
          isHost ? (
            <button className="main-btn" onClick={() => void room.playAgain()}>
              <Users size={18} /> Jugar otra vez
            </button>
          ) : (
            <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(180,255,205,0.6)' }}>
              Esperando a que el anfitrión arranque otra…
            </p>
          )
        ) : (
          <button className="main-btn" onClick={() => { void room.leave(); navigate('/public-setup'); }}>
            Buscar otra partida
          </button>
        )}
        <button className="ghost-btn" onClick={() => void handleSalir()}>Volver al lobby</button>
      </>
    );
  }

  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div className="spinner" />
    </div>
  );
}
