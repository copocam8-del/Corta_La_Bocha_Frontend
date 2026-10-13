import { useState } from 'react';
import { CircleUserRound, Flag, Landmark, Shield, Tag, type LucideIcon } from 'lucide-react';
import { columnasMemotest, medidasCarta, type IconoCarta } from '../../api/memotest';
import { usePantallaMemotest } from '../../games/usePantallaMemotest';
import type { RoomApi } from '../useRoom';
import type { RoomSnapshot } from '../types';
import type { MemotestView } from '../gameViews';
import { secondsUntil } from '../clock';
import { useNow } from '../useNow';
import { Countdown, MultiFinal, MultiHeader, Notices, Scoreboard } from '../MultiParts';
import { colorOf, nameOf } from '../players';

// Memotest multijugador: por turnos sobre el mismo tablero. Todos ven las cartas que se dan vuelta;
// si el del turno acierta un par, se lo lleva y sigue. El mazo queda en el servidor.

const ICONOS: Record<IconoCarta, LucideIcon> = { escudo: Shield, apodo: Tag, jugador: CircleUserRound, bandera: Flag, estadio: Landmark };

export default function MemotestMulti({ room, state }: { room: RoomApi; state: RoomSnapshot }) {
  const v = state.view as MemotestView;
  const phase = state.phase;
  const now = useNow(phase !== 'finished' && phase !== 'lobby', 250);
  const offset = room.offset();
  const [error, setError] = useState<string | null>(null);
  const pantalla = usePantallaMemotest();
  const columnas = columnasMemotest(v.cartas, pantalla.orientacion, pantalla.ancho);
  const medidas = medidasCarta(pantalla.orientacion, columnas);

  const header = <MultiHeader room={room} state={state} detail={`Memotest · ${v.tema}`} />;

  if (phase === 'finished') {
    return (
      <>
        {header}
        <MultiFinal room={room} state={state} />
      </>
    );
  }
  if (phase === 'countdown' || v.cartas === 0) {
    return (
      <>
        {header}
        <Countdown state={state} now={now} offset={offset} />
        <Scoreboard state={state} />
      </>
    );
  }

  const miTurno = phase === 'playing' && v.turno === state.me && !v.mostrando;
  const restantes = v.turnoHasta ? secondsUntil(v.turnoHasta, offset, now) : 0;
  const descubiertas = new Map(v.descubiertas.map((d) => [d.indice, d]));
  const abiertas = new Map(v.abiertas.map((d) => [d.indice, d]));

  const tocar = async (i: number) => {
    if (!miTurno || descubiertas.has(i) || abiertas.has(i)) return;
    const r = await room.action('flip', { carta: i });
    setError(r.ok ? null : r.error);
  };

  return (
    <>
      {header}
      <div className="card" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}
        data-testid="turno" role="status">
        {phase === 'playing' ? (
          <>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
              <span className="dot" style={{ background: colorOf(state, v.turno), width: 10, height: 10 }} />
              {v.mostrando ? 'No era par…' : miTurno ? <strong style={{ color: '#39ff8c' }}>¡Te toca!</strong> : <>Juega <strong>{nameOf(state, v.turno)}</strong></>}
            </span>
            {!v.mostrando && v.turnoHasta && (
              <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '20px', color: restantes <= 5 ? '#ef4444' : '#39ff8c' }}>{restantes}</span>
            )}
          </>
        ) : (
          <span style={{ fontSize: '14px' }}>¡Tablero completo! Siguiente en {secondsUntil(state.nextAt, offset, now)} s</span>
        )}
      </div>

      <div data-testid="mesa" data-columnas={columnas}
        style={{ display: 'grid', gridTemplateColumns: `repeat(${columnas}, minmax(0, 1fr))`, gap: '8px' }}>
        {Array.from({ length: v.cartas }, (_, i) => {
          const d = descubiertas.get(i);
          const a = abiertas.get(i);
          const vista = d ?? a;
          const Icon = vista ? ICONOS[vista.icono] : null;
          const col = d ? colorOf(state, d.userId) : '#fbbf24';
          return (
            <button key={i} data-carta={i} onClick={() => void tocar(i)} aria-label={vista ? vista.texto : 'Carta boca abajo'}
              disabled={!miTurno || !!vista}
              style={{
                aspectRatio: medidas.aspectRatio, minWidth: 0, borderRadius: '10px', cursor: miTurno && !vista ? 'pointer' : 'default', padding: '6px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px',
                border: `1px solid ${vista ? col : miTurno ? 'rgba(57,255,140,0.5)' : 'rgba(57,255,140,0.3)'}`,
                background: vista ? `${col}26` : 'repeating-linear-gradient(135deg, #052e16 0 10px, #064a22 10px 20px)',
                color: '#eafff2', transition: 'background 0.25s ease', opacity: 1,
              }}>
              {vista && Icon ? (
                <>
                  <Icon size={medidas.icono} color={col} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: `${medidas.fontSize}px`, fontWeight: 600, lineHeight: 1.2, textAlign: 'center', overflowWrap: 'anywhere' }}>{vista.texto}</span>
                </>
              ) : (
                <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '22px', color: 'rgba(124,255,178,0.35)' }}>?</span>
              )}
            </button>
          );
        })}
      </div>
      <Notices room={room} state={state} local={error} />
      <Scoreboard state={state} extra={(uid) => (
        <span style={{ fontSize: '11px', color: colorOf(state, uid) }}>· {v.paresPor[uid] ?? 0} pares</span>
      )} />
    </>
  );
}
