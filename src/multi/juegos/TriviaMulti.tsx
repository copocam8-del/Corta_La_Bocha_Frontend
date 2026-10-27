import { useState } from 'react';
import { Check, Clock, X } from 'lucide-react';
import QuestionCard from '../../games/QuestionCard';
import type { RoomApi } from '../useRoom';
import type { RoomSnapshot } from '../types';
import type { TriviaView } from '../gameViews';
import { secondsUntil } from '../clock';
import { useNow } from '../useNow';
import { Countdown, MultiFinal, MultiHeader, Notices, Scoreboard } from '../MultiParts';
import { nameOf } from '../players';

// Trivia multijugador: todos ven la misma pregunta a la vez. El servidor mide el tiempo y corrige;
// la correcta llega recién cuando termina la pregunta (cuando respondieron todos o se acabó el tiempo).
export default function TriviaMulti({ room, state }: { room: RoomApi; state: RoomSnapshot }) {
  const v = state.view as TriviaView;
  const phase = state.phase;
  const now = useNow(phase === 'countdown' || phase === 'playing' || phase === 'results');
  const offset = room.offset();
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const responder = async (opcion: number) => {
    if (enviando) return;
    setEnviando(true);
    const r = await room.action('answer', { opcion });
    setError(r.ok ? null : r.error);
    setEnviando(false);
  };

  const header = <MultiHeader room={room} state={state} />;

  if (phase === 'finished') {
    return (
      <>
        {header}
        <MultiFinal room={room} state={state} abajo>
          {v.revelada && <Revelada state={state} v={v} />}
        </MultiFinal>
      </>
    );
  }

  if (phase === 'countdown') {
    return (
      <>
        {header}
        <Countdown state={state} now={now} offset={offset} />
        <Scoreboard state={state} />
      </>
    );
  }

  if (!v.pregunta) return <div className="card" style={{ textAlign: 'center' }}><div className="spinner" /></div>;

  const enJuego = phase === 'playing';
  const restantes = enJuego ? Math.min(v.segundos, secondsUntil(v.endsAt, offset, now)) : 0;
  const respondi = v.miRespuesta !== undefined;
  return (
    <>
      {header}
      <QuestionCard
        pregunta={{ numero: v.numero, segundos: v.segundos, ...v.pregunta, dificultad: v.pregunta.dificultad as 'facil' | 'medio' | 'dificil' }}
        segundosRestantes={restantes}
        elegida={v.miRespuesta ?? null}
        revelada={!enJuego && v.revelada ? { correcta: v.revelada.correcta } : null}
        bloqueada={!enJuego || respondi || enviando}
        onElegir={(i) => void responder(i)}
      />
      {enJuego ? (
        <p role="status" className="ui-texto" style={{ fontSize: '14px' }} data-testid="estado-trivia">
          {respondi ? 'Respondiste. Esperando a los demás…' : 'Elegí una opción: suma más quien acierta más rápido.'}
          {' '}({v.respondieron.length}/{state.players.filter((p) => !p.left).length} respondieron)
        </p>
      ) : (
        v.revelada && <Revelada state={state} v={v} siguienteEn={phase === 'results' ? secondsUntil(state.nextAt, offset, now) : null} />
      )}
      <Notices room={room} state={state} local={error} />
      <Scoreboard state={state} />
    </>
  );
}

function Revelada({ state, v, siguienteEn = null }: { state: RoomSnapshot; v: TriviaView; siguienteEn?: number | null }) {
  const r = v.revelada!;
  const filas = [...r.resultados].sort((a, b) => b.puntos - a.puntos);
  return (
    <div className="card ui-filas" data-testid="resultado-pregunta">
      <p className="kicker">Pregunta {r.numero}{siguienteEn !== null ? ` · Siguiente en ${siguienteEn} s` : ''}</p>
      <div className="ui-filas">
        {filas.map((f) => (
          <div key={f.userId} className="ui-fila" style={{ minHeight: '48px', fontSize: '14px' }}>
            {f.correcta ? <Check size={15} color="#39ff8c" /> : f.opcion === null ? <Clock size={15} color="#fbbf24" /> : <X size={15} color="#f87171" />}
            <span style={{ flex: 1, fontWeight: f.userId === state.me ? 700 : 400 }}>{nameOf(state, f.userId)}</span>
            <span style={{ color: 'rgba(180,255,205,0.6)', fontSize: '12px' }}>
              {f.opcion === null ? 'sin responder' : `${'ABCD'[f.opcion]} · ${(f.ms / 1000).toFixed(1)} s`}
            </span>
            <strong style={{ color: '#39ff8c', fontFamily: "'Oswald', sans-serif", minWidth: '42px', textAlign: 'right' }}>+{f.puntos}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
