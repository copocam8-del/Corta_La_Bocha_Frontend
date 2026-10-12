import { useCallback, useEffect, useState } from 'react';
import { Check, Send, Skull } from 'lucide-react';
import Pelota from '../../games/Pelota';
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

const TECLADO = ['QWERTYUIOP', 'ASDFGHJKLÑ', 'ZXCVBNM'];

export default function AhorcadoMulti({ room, state }: { room: RoomApi; state: RoomSnapshot }) {
  const v = state.view as AhorcadoView;
  const phase = state.phase;
  const now = useNow(phase === 'countdown' || phase === 'playing' || phase === 'results');
  const offset = room.offset();
  const [intento, setIntento] = useState('');
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
        <MultiFinal room={room} state={state}>{v.revelada && <Revelada state={state} v={v} />}</MultiFinal>
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
      {header}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p className="kicker">Pista: <strong data-testid="pista">{v.pista}</strong></p>
        <p className="kicker" data-testid="reloj-ahorcado">{phase === 'playing' ? `${restantes} s` : ''}</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
        <Pelota errores={yo?.errores ?? 0} max={v.maxErrores} />
      </div>
      <p className="kicker" style={{ textAlign: 'center' }} data-testid="errores">Errores {yo?.errores ?? 0}/{v.maxErrores}</p>

      <div data-testid="mascara" aria-label="Palabra a adivinar" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px' }}>
        {mostrar.map((c, i) =>
          c === ' ' ? <span key={i} style={{ width: '14px' }} /> : (
            <span key={i} style={{
              minWidth: '24px', padding: '4px 2px', textAlign: 'center', borderBottom: '2px solid rgba(57,255,140,0.6)',
              fontFamily: "'Oswald', sans-serif", fontSize: '24px', fontWeight: 700, color: c === '_' ? 'transparent' : '#eafff2',
            }}>{c === '_' ? '·' : c}</span>
          ),
        )}
      </div>

      {phase === 'playing' && yo?.estado !== 'jugando' && (
        <div className="card" style={{ textAlign: 'center', padding: '12px' }} role="status">
          {yo?.estado === 'completo' ? '¡La completaste! Esperando a los demás…' : 'Se murió tu redonda. Esperando a los demás…'}
        </div>
      )}

      {jugando && yo && (
        <>
          <div data-testid="teclado" style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
            {TECLADO.map((fila) => (
              <div key={fila} style={{ display: 'flex', gap: '4px', width: '100%', justifyContent: 'center' }}>
                {[...fila].map((l) => {
                  const ok = yo.adivinadas.includes(l);
                  const mal = yo.erradas.includes(l);
                  return (
                    <button key={l} data-letra={l} onClick={() => letra(l)} disabled={ok || mal} aria-label={`Letra ${l}`}
                      style={{
                        flex: '1 1 0', maxWidth: '44px', height: '44px', borderRadius: '8px', cursor: 'pointer',
                        fontFamily: "'Oswald', sans-serif", fontSize: '16px', fontWeight: 700,
                        border: `1px solid ${ok ? '#39ff8c' : mal ? 'rgba(239,68,68,0.5)' : 'rgba(57,255,140,0.25)'}`,
                        background: ok ? 'rgba(57,255,140,0.2)' : mal ? 'rgba(239,68,68,0.12)' : 'rgba(4,20,11,0.7)',
                        color: ok ? '#39ff8c' : mal ? 'rgba(252,165,165,0.6)' : '#eafff2',
                      }}>{l}</button>
                  );
                })}
              </div>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); if (intento.trim()) void jugar('guess', { respuesta: intento }); setIntento(''); }}
            style={{ display: 'flex', gap: '6px' }}>
            <input className="grid-input" placeholder="¿La sabés? Arriesgá (un error si fallás)" value={intento}
              onChange={(e) => setIntento(e.target.value)} maxLength={60} style={{ textTransform: 'none' }} />
            <button className="option-btn" style={{ flex: 'none' }} type="submit" disabled={!intento.trim()} aria-label="Arriesgar">
              <Send size={14} />
            </button>
          </form>
        </>
      )}

      {phase === 'results' && v.revelada && (
        <Revelada state={state} v={v} siguienteEn={secondsUntil(state.nextAt, offset, now)} />
      )}

      {/* Rivales: sólo errores y avance */}
      {phase === 'playing' && v.rivales.length > 0 && (
        <div className="card" style={{ padding: '12px' }} data-testid="rivales">
          <p className="section-label">Rivales</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {v.rivales.map((r) => (
              <div key={r.userId} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                <span style={{ width: '96px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.username}</span>
                <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: 'rgba(57,255,140,0.1)', overflow: 'hidden' }}>
                  <div style={{ width: `${r.avance}%`, height: '100%', background: r.estado === 'muerto' ? '#f87171' : '#39ff8c', transition: 'width 0.3s ease' }} />
                </div>
                <span style={{ fontSize: '12px', color: r.errores >= 4 ? '#fca5a5' : 'rgba(180,255,205,0.7)', minWidth: '62px', textAlign: 'right' }}>
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
