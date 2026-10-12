import { useCallback, useEffect, useState } from 'react';
import { Flag, Send } from 'lucide-react';
import MultiShell from '../multi/MultiShell';
import BackButton from '../components/BackButton';
import { ABANDONAR } from '../components/abandonar';
import { menuPath } from '../games/multiConfig';
import Pelota from '../games/Pelota';
import GameResult from '../games/GameResult';
import {
  arriesgarRespuesta, empezarAhorcado, probarLetra, rendirse,
  type DificultadAhorcado, type PartidaAhorcado,
} from '../api/ahorcado';

// Ahorcado "Que no muera la redonda". El servidor elige la palabra y corrige cada letra; acá sólo
// se muestra el estado. Se juega con el teclado de la pantalla (celular) o con el de la compu.

const TECLADO = ['QWERTYUIOP', 'ASDFGHJKLÑ', 'ZXCVBNM'];
const DIFICULTADES: { id: DificultadAhorcado; label: string; desc: string }[] = [
  { id: 'facil', label: 'Fácil', desc: 'Nombres cortos y muy conocidos' },
  { id: 'medio', label: 'Medio', desc: 'Nombre y apellido, clubes y estadios' },
  { id: 'dificil', label: 'Difícil', desc: 'Más largos o menos conocidos' },
];

const mensajeError = (e: unknown) =>
  (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'No se pudo conectar con el servidor. Probá de nuevo.';

export default function Ahorcado() {
  const [dificultad, setDificultad] = useState<DificultadAhorcado | null>(null);
  const [partida, setPartida] = useState<PartidaAhorcado | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [intento, setIntento] = useState('');

  const empezar = async (d: DificultadAhorcado) => {
    setDificultad(d);
    setCargando(true);
    setError(null);
    setIntento('');
    try {
      setPartida(await empezarAhorcado(d));
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setCargando(false);
    }
  };

  const jugar = useCallback(async (accion: () => Promise<PartidaAhorcado>) => {
    setCargando(true);
    setError(null);
    try {
      setPartida(await accion());
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setCargando(false);
    }
  }, []);

  const letra = useCallback((l: string) => {
    if (!partida || partida.terminada || cargando) return;
    if (partida.adivinadas.includes(l) || partida.erradas.includes(l)) return;
    void jugar(() => probarLetra(partida.matchId, l));
  }, [partida, cargando, jugar]);

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

  // ── Elegir dificultad ─────────────────────────────────────────────────────────────────────
  if (!partida) {
    return (
      <MultiShell maxWidth={480}>
        <BackButton to={menuPath('ahorcado')} />
        <div style={{ textAlign: 'center' }}>
          <p className="kicker">Ahorcado futbolero</p>
          <h1 className="neon-title" style={{ fontSize: '28px', marginTop: '6px' }}>Que no muera la redonda</h1>
          <p style={{ fontSize: '13px', color: 'rgba(180,255,205,0.7)', marginTop: '8px' }}>
            Adiviná el nombre letra por letra. Con cada error la pelota se desinfla: al sexto, muere la redonda.
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}><Pelota errores={0} max={6} /></div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p className="section-label">Dificultad</p>
          {DIFICULTADES.map((d) => (
            <button key={d.id} className="option-btn" style={{ textAlign: 'left', padding: '12px' }} disabled={cargando} onClick={() => void empezar(d.id)}>
              {d.label} <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400, opacity: 0.7 }}>· {d.desc}</span>
            </button>
          ))}
        </div>
        {error && <div className="error">{error}</div>}
      </MultiShell>
    );
  }

  const terminada = partida.terminada;
  return (
    <MultiShell maxWidth={560}>
      {/* En medio de la partida, salir = rendirse (cuenta como perdida) */}
      <BackButton to={menuPath('ahorcado')} confirm={terminada ? null : ABANDONAR}
        onLeave={() => (terminada ? undefined : rendirse(partida.matchId))} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p className="kicker">Pista: <strong data-testid="pista">{partida.pista}</strong></p>
        <p className="kicker" data-testid="errores">Errores {partida.errores}/{partida.maxErrores}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Pelota errores={partida.errores} max={partida.maxErrores} />
      </div>

      {/* Palabra */}
      <div data-testid="mascara" aria-label="Palabra a adivinar" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px' }}>
        {(terminada && partida.respuesta ? [...partida.respuesta.toUpperCase()] : partida.mascara).map((c, i) =>
          c === ' ' ? <span key={i} style={{ width: '14px' }} /> : (
            <span key={i} style={{
              minWidth: '24px', padding: '4px 2px', textAlign: 'center', borderBottom: '2px solid rgba(57,255,140,0.6)',
              fontFamily: "'Oswald', sans-serif", fontSize: '24px', fontWeight: 700,
              color: c === '_' ? 'transparent' : terminada && !partida.gano ? '#fca5a5' : '#eafff2',
            }}>{c === '_' ? '·' : c}</span>
          ),
        )}
      </div>

      {terminada ? (
        <GameResult
          titulo={partida.gano ? '¡Salvaste la redonda!' : '¡Murió la redonda!'}
          gano={!!partida.gano}
          puntos={partida.puntos ?? 0}
          logros={partida.logros}
          onJugarOtra={() => void empezar(dificultad ?? partida.dificultad)}
        >
          <p style={{ fontSize: '14px', color: 'rgba(180,255,205,0.85)' }}>
            Era: <strong data-testid="respuesta">{partida.respuesta}</strong> · {partida.segundos} s
          </p>
        </GameResult>
      ) : (
        <>
          {/* Teclado en pantalla */}
          <div data-testid="teclado" style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
            {TECLADO.map((fila) => (
              <div key={fila} style={{ display: 'flex', gap: '4px', width: '100%', justifyContent: 'center' }}>
                {[...fila].map((l) => {
                  const ok = partida.adivinadas.includes(l);
                  const mal = partida.erradas.includes(l);
                  return (
                    <button key={l} data-letra={l} onClick={() => letra(l)} disabled={ok || mal || cargando}
                      aria-label={`Letra ${l}`}
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

          <form onSubmit={(e) => { e.preventDefault(); if (intento.trim()) void jugar(() => arriesgarRespuesta(partida.matchId, intento)); setIntento(''); }}
            style={{ display: 'flex', gap: '6px' }}>
            <input className="grid-input" placeholder="¿La sabés? Arriesgá (un error si fallás)" value={intento}
              onChange={(e) => setIntento(e.target.value)} maxLength={60} style={{ textTransform: 'none' }} />
            <button className="option-btn" style={{ flex: 'none' }} type="submit" disabled={cargando || !intento.trim()} aria-label="Arriesgar">
              <Send size={14} />
            </button>
          </form>
          <button className="ghost-btn" onClick={() => void jugar(() => rendirse(partida.matchId))} disabled={cargando}>
            <Flag size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> Rendirme
          </button>
        </>
      )}
      {error && <div className="error">{error}</div>}
    </MultiShell>
  );
}
