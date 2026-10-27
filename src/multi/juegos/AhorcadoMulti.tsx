import { useCallback, useEffect, useState } from 'react';
import { Check, Skull } from 'lucide-react';
import Pelota from '../../games/Pelota';
import { AHORCADO_CSS, Arriesgar, Mascara, Teclado } from '../../games/AhorcadoUI';
import type { RoomApi } from '../useRoom';
import type { RoomSnapshot } from '../types';
import type { AhorcadoView } from '../gameViews';
import { secondsUntil } from '../clock';
import { useNow } from '../useNow';
import { Countdown, MultiFinal, MultiHeader, Notices, Scoreboard } from '../MultiParts';
import { nameOf } from '../players';

// Ahorcado multijugador: todos adivinan la misma palabra a la vez, cada uno con su pelota. De los
// rivales se ve cuántos errores llevan y cuánto avanzaron (nunca sus letras). La palabra llega
// recién cuando termina la ronda.

export default function AhorcadoMulti({ room, state }: { room: RoomApi; state: RoomSnapshot }) {
  const v = state.view as AhorcadoView;
  const phase = state.phase;
  const now = useNow(phase === 'countdown' || phase === 'playing' || phase === 'results');
  const offset = room.offset();
  const [error, setError] = useState<string | null>(null);
  const yo = v.yo;
  const jugando = phase === 'playing' && yo?.estado === 'jugando';

  const jugar = useCallback(async (type: 'letter' | 'guess', payload: object) => {
    const r = await room.action(type, payload);
    setError(r.ok ? null : r.error);
  }, [room]);

  const letra = useCallback((l: string) => {
    if (!jugando || !yo || yo.adivinadas.includes(l) || yo.erradas.includes(l)) return;
    void jugar('letter', { letra: l });
  }, [jugando, yo, jugar]);

  // Teclado físico
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if ((ev.target as HTMLElement)?.tagName === 'INPUT') return;
      const k = ev.key.toUpperCase();
      if (/^[A-ZÑ]$/.test(k)) letra(k);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [letra]);

  const header = <MultiHeader room={room} state={state} detail={`Ahorcado · ${v.dificultad === 'facil' ? 'Fácil' : v.dificultad === 'medio' ? 'Medio' : 'Difícil'}`} />;

  if (phase === 'finished') {
    return (
      <>
        {header}
        <MultiFinal room={room} state={state} abajo>{v.revelada && <Revelada state={state} v={v} />}</MultiFinal>
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

  const restantes = phase === 'playing' ? secondsUntil(v.endsAt, offset, now) : 0;
  const mostrar = phase === 'results' && v.revelada ? [...v.revelada.respuesta.toUpperCase()] : yo?.mascara ?? [];
  return (
    <>
      <style>{AHORCADO_CSS}</style>
      {header}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p className="kicker">Pista: <strong data-testid="pista">{v.pista}</strong></p>
        <p className="kicker" data-testid="reloj-ahorcado">{phase === 'playing' ? `${restantes} s` : ''}</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
        <Pelota errores={yo?.errores ?? 0} max={v.maxErrores} />
      </div>
      <p className="kicker" style={{ textAlign: 'center' }} data-testid="errores">Errores {yo?.errores ?? 0}/{v.maxErrores}</p>

      <Mascara letras={mostrar} />

      {phase === 'playing' && yo?.estado !== 'jugando' && (
        <div className="card ui-texto" style={{ padding: '14px', color: '#eafff2' }} role="status">
          {yo?.estado === 'completo' ? '¡La completaste! Esperando a los demás…' : 'Se murió tu redonda. Esperando a los demás…'}
        </div>
      )}

      {jugando && yo && (
        <>
          <Teclado adivinadas={yo.adivinadas} erradas={yo.erradas} onLetra={letra} />
          <Arriesgar onArriesgar={(texto) => void jugar('guess', { respuesta: texto })} />
        </>
      )}

      {phase === 'results' && v.revelada && (
        <Revelada state={state} v={v} siguienteEn={secondsUntil(state.nextAt, offset, now)} />
      )}

      {/* Rivales: sólo errores y avance */}
      {phase === 'playing' && v.rivales.length > 0 && (
        <div className="card ui-filas" data-testid="rivales">
          <p className="kicker">Rivales</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {v.rivales.map((r) => (
              <div key={r.userId} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <span style={{ width: '96px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.username}</span>
                <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: 'rgba(57,255,140,0.1)', overflow: 'hidden' }}>
                  <div style={{ width: `${r.avance}%`, height: '100%', background: r.estado === 'muerto' ? '#f87171' : '#39ff8c', transition: 'width 0.3s ease' }} />
                </div>
                <span style={{ fontSize: '12px', color: r.errores >= 4 ? '#fca5a5' : 'rgba(180,255,205,0.7)', minWidth: '72px', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px' }}>
                  {r.estado === 'completo' ? <><Check size={13} style={{ verticalAlign: 'middle' }} /> lista</>
                    : r.estado === 'muerto' ? <><Skull size={13} style={{ verticalAlign: 'middle' }} /> murió</>
                    : `${r.errores}/${v.maxErrores} err.`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      <Notices room={room} state={state} local={error} />
      <Scoreboard state={state} />
    </>
  );
}

function Revelada({ state, v, siguienteEn = null }: { state: RoomSnapshot; v: AhorcadoView; siguienteEn?: number | null }) {
  const r = v.revelada!;
  return (
    <div className="card" data-testid="resultado-palabra">
      <p className="kicker">Palabra {r.numero}: <strong data-testid="respuesta">{r.respuesta}</strong>{siguienteEn !== null ? ` · Siguiente en ${siguienteEn} s` : ''}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
        {[...r.resultados].sort((a, b) => b.puntos - a.puntos).map((f) => (
          <div key={f.userId} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            {f.estado === 'completo' ? <Check size={15} color="#39ff8c" /> : <Skull size={15} color="#f87171" />}
            <span style={{ flex: 1, fontWeight: f.userId === state.me ? 700 : 400 }}>{nameOf(state, f.userId)}</span>
            <span style={{ color: 'rgba(180,255,205,0.6)', fontSize: '12px' }}>
              {f.estado === 'completo' ? `${f.errores} err. · ${f.segundos} s` : f.estado === 'muerto' ? 'murió la redonda' : 'no llegó'}
            </span>
            <strong style={{ color: '#39ff8c', fontFamily: "'Oswald', sans-serif", minWidth: '42px', textAlign: 'right' }}>+{f.puntos}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
