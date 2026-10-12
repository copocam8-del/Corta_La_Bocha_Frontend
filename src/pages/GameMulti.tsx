import { useEffect, useRef, useState } from 'react';
import { StopCircle, Timer, WifiOff } from 'lucide-react';
import type { RoomApi } from '../multi/useRoom';
import type { RoomSnapshot } from '../multi/types';
import { temaLabel } from '../multi/types';
import { secondsUntil } from '../multi/clock';
import { useNow } from '../multi/useNow';
import { MultiRoundResults } from '../multi/MultiRoundResults';
import { MultiFinal, Scoreboard } from '../multi/MultiParts';
import { missingCategories } from '../game/round';

// Partida multijugador de Tutti Frutti en curso. Todo lo decide el servidor (letra, reloj, ¡Basta!,
// validación y puntaje); acá se muestra el estado y se mandan las respuestas mientras el jugador escribe.
// (Los otros juegos tienen su pantalla en src/multi/juegos/.)

const SEND_DEBOUNCE_MS = 350;

export default function GameMulti({ room, state }: { room: RoomApi; state: RoomSnapshot }) {
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
    return (
      <>
        {header}
        <MultiFinal room={room} state={state}>
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
        </MultiFinal>
      </>
    );
  }

  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div className="spinner" />
    </div>
  );
}
