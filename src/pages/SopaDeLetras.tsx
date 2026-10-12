import { useEffect, useRef, useState } from 'react';
import { Flag } from 'lucide-react';
import MultiShell from '../multi/MultiShell';
import BackButton from '../components/BackButton';
import { ABANDONAR } from '../components/abandonar';
import { menuPath } from '../games/multiConfig';
import GameResult from '../games/GameResult';
import { useNow } from '../multi/useNow';
import { secondsLeft } from '../game/round';
import { celdasEntre, lineaRecta, type Celda } from '../games/sopaLinea';
import { empezarSopa, marcarSopa, terminarSopa, TEMATICAS_SOPA, type DificultadSopa, type PartidaSopa } from '../api/sopa';

// Sopa de letras futbolera. Se marca arrastrando (mouse o dedo) desde la primera letra hasta la
// última, o tocando la primera y después la última. El servidor verifica cada palabra.

const COLORES = ['#39ff8c', '#fbbf24', '#60a5fa', '#f472b6', '#a78bfa', '#34d399', '#fb923c', '#f87171', '#22d3ee', '#facc15'];
const mensajeError = (e: unknown) =>
  (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'No se pudo conectar con el servidor. Probá de nuevo.';

export default function SopaDeLetras() {
  const [tematica, setTematica] = useState('jugadores');
  const [dificultad, setDificultad] = useState<DificultadSopa>('facil');
  const [partida, setPartida] = useState<PartidaSopa | null>(null);
  const [fin, setFin] = useState(0);
  const [desde, setDesde] = useState<Celda | null>(null);
  const [hasta, setHasta] = useState<Celda | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const arrastrando = useRef(false);
  const movio = useRef(false);
  const now = useNow(!!partida && !partida.terminada, 500);

  const empezar = async () => {
    setError(null);
    try {
      const p = await empezarSopa(tematica, dificultad);
      setPartida(p);
      setFin(Date.now() + p.restantes * 1000);
      setDesde(null);
      setHasta(null);
      setMensaje(null);
    } catch (e) {
      setError(mensajeError(e));
    }
  };

  // Se acabó el tiempo: termina con lo encontrado
  useEffect(() => {
    if (!partida || partida.terminada) return;
    const t = setTimeout(() => {
      void terminarSopa(partida.matchId).then(setPartida).catch((e) => setError(mensajeError(e)));
    }, Math.max(0, fin - Date.now()));
    return () => clearTimeout(t);
  }, [partida, fin]);

  const tamano = partida?.grilla.length ?? 0;
  const celdaEn = (x: number, y: number): Celda | null => {
    const el = document.elementFromPoint(x, y)?.closest('[data-f]') as HTMLElement | null;
    return el ? { f: Number(el.dataset.f), c: Number(el.dataset.c) } : null;
  };

  const enviar = async (a: Celda, b: Celda) => {
    if (!partida) return;
    try {
      const r = await marcarSopa(partida.matchId, a, b);
      setPartida(r);
      setMensaje(r.terminada ? null : r.ok ? `¡${r.palabra}!` : r.motivo ?? null);
    } catch (e) {
      setError(mensajeError(e));
    }
  };

  const onDown = (e: React.PointerEvent) => {
    const c = celdaEn(e.clientX, e.clientY);
    if (!c || partida?.terminada) return;
    arrastrando.current = true;
    movio.current = false;
    // Modo "tocar la primera y después la última": si ya había una marcada, este toque es el final
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
      setHasta(null); // quedó marcada la primera: falta tocar la última
    }
  };

  // Colores de las celdas ya encontradas
  const color = new Map<string, string>();
  const lista = partida?.terminada ? partida.todas ?? partida.encontradas : partida?.encontradas ?? [];
  lista.forEach((w, i) => {
    const encontrada = partida?.encontradas.some((e) => e.palabra === w.palabra);
    for (const c of w.celdas) color.set(`${c.f},${c.c}`, encontrada ? COLORES[i % COLORES.length] : 'rgba(255,255,255,0.35)');
  });
  const seleccion = new Set((desde ? celdasEntre(desde, hasta ?? desde) : []).map((c) => `${c.f},${c.c}`));

  if (!partida) {
    return (
      <MultiShell maxWidth={480}>
        <BackButton to={menuPath('sopa_de_letras')} />
        <div style={{ textAlign: 'center' }}>
          <p className="kicker">Sopa de letras</p>
          <h1 className="neon-title" style={{ fontSize: '28px', marginTop: '6px' }}>Buscá los nombres</h1>
          <p style={{ fontSize: '13px', color: 'rgba(180,255,205,0.7)', marginTop: '8px' }}>
            Arrastrá desde la primera hasta la última letra (o tocá la primera y después la última).
          </p>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <p className="section-label">Temática</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {TEMATICAS_SOPA.map((t) => (
                <button key={t.id} className={`option-btn${tematica === t.id ? ' active' : ''}`} style={{ flex: 'none' }} onClick={() => setTematica(t.id)}>{t.nombre}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="section-label">Dificultad</p>
            <div style={{ display: 'flex', gap: '6px' }}>
              {([['facil', 'Fácil'], ['medio', 'Medio'], ['dificil', 'Difícil']] as const).map(([id, label]) => (
                <button key={id} className={`option-btn${dificultad === id ? ' active' : ''}`} onClick={() => setDificultad(id)}>{label}</button>
              ))}
            </div>
            <p style={{ fontSize: '11px', color: 'rgba(180,255,205,0.55)', marginTop: '6px' }}>
              {dificultad === 'facil' ? '10×10, horizontal y vertical, 3 minutos' : dificultad === 'medio' ? '12×12, también en diagonal, 4 minutos' : '14×14, en cualquier dirección y al revés, 5 minutos'}
            </p>
          </div>
          <button className="main-btn" data-testid="empezar-sopa" onClick={() => void empezar()}>¡Arrancar!</button>
        </div>
        {error && <div className="error">{error}</div>}
      </MultiShell>
    );
  }

  const restantes = partida.terminada ? 0 : Math.min(partida.segundos, secondsLeft(fin, now));
  return (
    <MultiShell maxWidth={560}>
      {/* En medio de la partida, salir = terminarla con lo encontrado (no la ganás) */}
      <BackButton to={menuPath('sopa_de_letras')} confirm={partida.terminada ? null : ABANDONAR}
        onLeave={() => (partida.terminada ? undefined : terminarSopa(partida.matchId))} />
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span className="kicker">{partida.tematica}</span>
        <span className="kicker" data-testid="reloj-sopa">{Math.floor(restantes / 60)}:{String(restantes % 60).padStart(2, '0')}</span>
      </div>

      <div
        data-testid="grilla"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        style={{
          display: 'grid', gridTemplateColumns: `repeat(${tamano}, 1fr)`, gap: '2px', touchAction: 'none', userSelect: 'none',
          background: 'rgba(4,20,11,0.75)', border: '1px solid rgba(57,255,140,0.3)', borderRadius: '12px', padding: '6px',
        }}
      >
        {partida.grilla.flatMap((fila, f) =>
          [...fila].map((letra, c) => {
            const k = `${f},${c}`;
            const col = color.get(k);
            const sel = seleccion.has(k);
            return (
              <div key={k} data-f={f} data-c={c} style={{
                aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px',
                fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontSize: tamano > 12 ? '13px' : '16px',
                background: sel ? 'rgba(57,255,140,0.45)' : col ? `${col}33` : 'transparent',
                color: sel ? '#04210f' : col ?? '#eafff2', cursor: 'pointer',
              }}>{letra}</div>
            );
          }),
        )}
      </div>

      {mensaje && <p role="status" style={{ textAlign: 'center', fontSize: '13px', color: mensaje.startsWith('¡') ? '#39ff8c' : '#fca5a5' }}>{mensaje}</p>}

      <div className="card" data-testid="palabras" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '12px' }}>
        {partida.palabras.map((p) => {
          const ok = partida.encontradas.some((e) => e.palabra === p);
          return (
            <span key={p} style={{
              fontFamily: "'Oswald', sans-serif", fontSize: '13px', letterSpacing: '1px', padding: '3px 8px', borderRadius: '999px',
              border: '1px solid rgba(57,255,140,0.25)', textDecoration: ok ? 'line-through' : 'none', opacity: ok ? 0.5 : 1,
            }}>{p}</span>
          );
        })}
      </div>

      {partida.terminada ? (
        <GameResult titulo={partida.gano ? '¡Las encontraste todas!' : 'Se terminó la sopa'} gano={!!partida.gano} puntos={partida.puntos ?? 0}
          logros={partida.logros} onJugarOtra={() => setPartida(null)}>
          <p style={{ fontSize: '14px', color: 'rgba(180,255,205,0.85)' }}>{partida.encontradas.length} de {partida.palabras.length} palabras</p>
        </GameResult>
      ) : (
        <button className="ghost-btn" onClick={() => void terminarSopa(partida.matchId).then(setPartida).catch((e) => setError(mensajeError(e)))}>
          <Flag size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> Terminar
        </button>
      )}
      {error && <div className="error">{error}</div>}
    </MultiShell>
  );
}
