import { useRef, useState, type CSSProperties } from 'react';
import { celdasEntre, lineaRecta, SOPA_ANCHO, SOPA_LETRA, type Celda } from '../../games/sopaLinea';
import type { RoomApi } from '../useRoom';
import type { RoomSnapshot } from '../types';
import type { SopaView } from '../gameViews';
import { secondsUntil } from '../clock';
import { useNow } from '../useNow';
import { Countdown, MultiFinal, MultiHeader, Notices, Scoreboard } from '../MultiParts';
import { colorOf, nameOf } from '../players';

// Sopa de letras multijugador: misma grilla para todos; cada palabra es del primero que la
// encuentra (se pinta con su color). Se marca igual que jugando solo: arrastrando o tocando la
// primera y la última letra. El servidor verifica y decide quién llegó primero.
export default function SopaMulti({ room, state }: { room: RoomApi; state: RoomSnapshot }) {
  const v = state.view as SopaView;
  const phase = state.phase;
  const now = useNow(phase === 'countdown' || phase === 'playing' || phase === 'results', 500);
  const offset = room.offset();
  const [desde, setDesde] = useState<Celda | null>(null);
  const [hasta, setHasta] = useState<Celda | null>(null);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);
  const arrastrando = useRef(false);
  const movio = useRef(false);

  const header = <MultiHeader room={room} state={state} detail={`Sopa de letras · ${v.tematica}`} />;

  if (phase === 'finished') {
    return (
      <>
        {header}
        <MultiFinal room={room} state={state} abajo />
      </>
    );
  }
  if (phase === 'countdown' || !v.grilla) {
    return (
      <>
        {header}
        <Countdown state={state} now={now} offset={offset} />
        <Scoreboard state={state} />
      </>
    );
  }

  const grilla = v.grilla;
  const tamano = grilla.length;
  const jugando = phase === 'playing';
  const restantes = jugando ? secondsUntil(v.endsAt, offset, now) : 0;

  const celdaEn = (x: number, y: number): Celda | null => {
    const el = document.elementFromPoint(x, y)?.closest('[data-f]') as HTMLElement | null;
    return el ? { f: Number(el.dataset.f), c: Number(el.dataset.c) } : null;
  };

  const enviar = async (a: Celda, b: Celda) => {
    const r = await room.action('mark', { desde: a, hasta: b });
    setMensaje(r.ok ? { ok: true, texto: '¡Bien! Es tuya.' } : { ok: false, texto: r.error });
  };

  const onDown = (e: React.PointerEvent) => {
    const c = celdaEn(e.clientX, e.clientY);
    if (!c || !jugando) return;
    arrastrando.current = true;
    movio.current = false;
    if (desde && !hasta) {
      setHasta(lineaRecta(desde, c, tamano));
      return;
    }
    setDesde(c);
    setHasta(null);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!arrastrando.current || !desde) return;
    const c = celdaEn(e.clientX, e.clientY);
    if (!c) return;
    if (c.f !== desde.f || c.c !== desde.c) movio.current = true;
    setHasta(lineaRecta(desde, c, tamano));
  };
  const onUp = () => {
    arrastrando.current = false;
    if (!desde) return;
    if (hasta && (hasta.f !== desde.f || hasta.c !== desde.c)) {
      void enviar(desde, hasta);
      setDesde(null);
      setHasta(null);
    } else if (!movio.current) {
      setHasta(null);
    }
  };

  // Color de cada celda: el del jugador que encontró la palabra (al final, también las que nadie encontró)
  const color = new Map<string, string>();
  const lista = phase === 'results' && v.revelada ? v.revelada.todas : v.encontradas;
  for (const w of lista) {
    const c = w.userId ? colorOf(state, w.userId) : 'rgba(255,255,255,0.35)';
    for (const cel of w.celdas) color.set(`${cel.f},${cel.c}`, c);
  }
  const seleccion = new Set((desde ? celdasEntre(desde, hasta ?? desde) : []).map((c) => `${c.f},${c.c}`));
  const duenio = new Map(v.encontradas.map((e) => [e.palabra, e.userId]));

  return (
    <>
      {header}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span className="kicker">{v.encontradas.length}/{v.palabras.length} palabras</span>
        <span className="kicker" data-testid="reloj-sopa">
          {jugando ? `${Math.floor(restantes / 60)}:${String(restantes % 60).padStart(2, '0')}` : `Siguiente en ${secondsUntil(state.nextAt, offset, now)} s`}
        </span>
      </div>

      <div
        data-testid="grilla"
        className="card ui-ancho"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        style={{
          display: 'grid', gridTemplateColumns: `repeat(${tamano}, minmax(0, 1fr))`, gap: '2px', touchAction: 'none', userSelect: 'none',
          padding: '8px', '--ancho': `${SOPA_ANCHO}px`, '--n': tamano,
        } as CSSProperties}
      >
        {grilla.flatMap((fila, f) =>
          [...fila].map((letra, c) => {
            const k = `${f},${c}`;
            const col = color.get(k);
            const sel = seleccion.has(k);
            return (
              <div key={k} data-f={f} data-c={c} style={{
                aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px',
                fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontSize: SOPA_LETRA,
                background: sel ? 'rgba(57,255,140,0.45)' : col ? `${col}33` : 'transparent',
                color: sel ? '#04210f' : col ?? '#eafff2', cursor: jugando ? 'pointer' : 'default',
              }}>{letra}</div>
            );
          }),
        )}
      </div>

      {mensaje && jugando && (
        <p role="status" className="ui-texto" style={{ fontWeight: 600, color: mensaje.ok ? '#39ff8c' : '#fca5a5' }}>{mensaje.texto}</p>
      )}

      <div className="card" data-testid="palabras" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '12px' }}>
        {v.palabras.map((p) => {
          const uid = duenio.get(p);
          return (
            <span key={p} title={uid ? `La encontró ${nameOf(state, uid)}` : undefined} style={{
              fontFamily: "'Oswald', sans-serif", fontSize: '13px', letterSpacing: '1px', padding: '3px 8px', borderRadius: '999px',
              border: `1px solid ${uid ? colorOf(state, uid) : 'rgba(57,255,140,0.25)'}`, textDecoration: uid ? 'line-through' : 'none',
              opacity: uid ? 0.7 : 1, color: uid ? colorOf(state, uid) : '#eafff2',
            }}>{p}{uid ? ` · ${nameOf(state, uid)}` : ''}</span>
          );
        })}
      </div>
      <Notices room={room} state={state} />
      <Scoreboard state={state} extra={(uid) => (
        <span className="dot" style={{ background: colorOf(state, uid), width: 8, height: 8 }} aria-hidden="true" />
      )} />
    </>
  );
}
