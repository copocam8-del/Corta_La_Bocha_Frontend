import { useState, type FormEvent } from 'react';
import { isAxiosError } from 'axios';
import { Eye, EyeOff, Megaphone, Play, Plus, RotateCcw, Smartphone, Users, VenetianMask, X } from 'lucide-react';
import MultiShell from '../multi/MultiShell';
import BackButton from '../components/BackButton';
import { SALIR_EN_PERSONA } from '../components/abandonar';
import { menuPath, MULTI_CONFIG } from '../games/multiConfig';
import { pedirPalabrasEnPersona } from '../api/impostor';
import {
  armarRondas, errorNombre, guardarNombres, leerNombresGuardados, limpiarNombre, MAX_JUGADORES, MIN_JUGADORES, NOMBRE_MAX,
  ordenPistas, type RondaEnPersona,
} from '../games/impostor/presencial';

// El Impostor "En persona" (/juego/impostor/en-persona): un solo celular que se pasan. Se cargan los
// nombres, el backend da las palabras y todo lo demás pasa acá: cada uno ve su palabra (o "Sos el
// impostor") a su turno, las pistas y la votación son en voz alta y al final se revela. No cuenta
// para estadísticas ni logros. Pensado primero para el celular.

const ROJO = '#f87171';
const config = MULTI_CONFIG.impostor;

const ESTILOS = `
  .ep-titulo { font-family: 'Oswald', sans-serif; font-weight: 700; text-transform: uppercase; color: #eafff2; line-height: 1.1;
    font-size: clamp(24px, 7vw, 32px); text-align: center; overflow-wrap: anywhere; }
  .ep-palabra { font-family: 'Oswald', sans-serif; font-weight: 700; text-transform: uppercase; line-height: 1.05; text-align: center;
    font-size: clamp(34px, 11vw, 56px); color: #eafff2; text-shadow: 0 0 18px rgba(57,255,140,0.55); overflow-wrap: anywhere; }
  .ep-palabra.impostor { color: ${ROJO}; text-shadow: 0 0 18px rgba(248,113,113,0.55); }
  .ep-sub { text-align: center; font-size: 14px; color: rgba(180,255,205,0.75); line-height: 1.5; }
  .ep-nombre { display: flex; align-items: center; gap: 10px; padding: 8px 8px 8px 12px; border-radius: 10px;
    background: rgba(57,255,140,0.04); border: 1px solid rgba(57,255,140,0.15); font-size: 15px; }
  .ep-nombre span { flex: 1; overflow-wrap: anywhere; }
  .ep-x { width: 36px; height: 36px; border-radius: 8px; border: 1px solid rgba(239,68,68,0.35); background: rgba(239,68,68,0.08);
    color: #fca5a5; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
  .ep-input { flex: 1; min-width: 0; background: rgba(57,255,140,0.04); border: 1px solid rgba(57,255,140,0.25); border-radius: 10px;
    color: #eafff2; padding: 12px; font-size: 16px; outline: none; }
  .ep-input:focus { border-color: rgba(57,255,140,0.7); }
  .ep-add { width: 48px; border-radius: 10px; border: 1px solid rgba(57,255,140,0.5); background: rgba(57,255,140,0.12); color: #39ff8c;
    display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
  .ep-add:disabled { opacity: 0.4; cursor: default; }
  .ep-orden { display: flex; flex-wrap: wrap; gap: 6px; list-style: none; }
  .ep-orden li { padding: 5px 10px; border-radius: 999px; font-size: 14px; background: rgba(57,255,140,0.08); border: 1px solid rgba(57,255,140,0.25); }
  .ep-orden li.primero { border-color: #fbbf24; background: rgba(251,191,36,0.14); color: #fde68a; }
  .ep-fila { display: flex; justify-content: space-between; gap: 10px; padding: 10px 12px; border-radius: 10px;
    background: rgba(57,255,140,0.03); border: 1px solid rgba(57,255,140,0.12); font-size: 14px; }
  .ep-revela { animation: epRevela 0.9s cubic-bezier(.2,1.4,.4,1) both; }
  .ep-revela-2 { animation: epRevela 0.7s ease 0.7s both; }
  @keyframes epRevela { from { opacity: 0; transform: scale(0.6) rotateX(70deg); } to { opacity: 1; transform: none; } }
  @media (prefers-reduced-motion: reduce) { .ep-revela, .ep-revela-2 { animation: none; } }
`;

type Paso =
  | { tipo: 'preparar' }
  | { tipo: 'pasar'; jugador: number; viendo: boolean }
  | { tipo: 'pistas' }
  | { tipo: 'votar' }
  | { tipo: 'revelar' }
  | { tipo: 'final' };

export default function ImpostorPresencial() {
  const [jugadores, setJugadores] = useState<string[]>(() => leerNombresGuardados());
  const [tematica, setTematica] = useState(config.defaults.tematica);
  const [cantidadRondas, setCantidadRondas] = useState(config.defaults.rounds);
  const [rondas, setRondas] = useState<RondaEnPersona[]>([]);
  const [actual, setActual] = useState(0);
  const [paso, setPaso] = useState<Paso>({ tipo: 'preparar' });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ronda = rondas[actual];

  const jugar = async () => {
    if (jugadores.length < MIN_JUGADORES || cargando) return;
    setCargando(true);
    setError(null);
    guardarNombres(jugadores);
    try {
      const palabras = await pedirPalabrasEnPersona(tematica, cantidadRondas);
      setRondas(armarRondas(jugadores.length, palabras));
      setActual(0);
      setPaso({ tipo: 'pasar', jugador: 0, viendo: false });
    } catch (e) {
      setError(isAxiosError(e) && e.response?.status === 429
        ? 'Pidieron muchas partidas seguidas. Esperá un minuto y probá de nuevo.'
        : 'No pudimos traer las palabras. Revisá la conexión y probá de nuevo.');
      setPaso({ tipo: 'preparar' });
    } finally {
      setCargando(false);
    }
  };

  const tapar = (jugador: number) =>
    setPaso(jugador + 1 < jugadores.length ? { tipo: 'pasar', jugador: jugador + 1, viendo: false } : { tipo: 'pistas' });

  const siguiente = () => {
    if (actual + 1 < rondas.length) {
      setActual(actual + 1);
      setPaso({ tipo: 'pasar', jugador: 0, viendo: false });
    } else {
      setPaso({ tipo: 'final' });
    }
  };

  const enPartida = paso.tipo !== 'preparar' && paso.tipo !== 'final';

  return (
    <MultiShell maxWidth={480}>
      <style>{ESTILOS}</style>
      <BackButton to={menuPath('impostor')} confirm={enPartida ? SALIR_EN_PERSONA : null} />

      {paso.tipo === 'preparar' && (
        <Preparacion
          jugadores={jugadores} setJugadores={setJugadores} tematica={tematica} setTematica={setTematica}
          rondas={cantidadRondas} setRondas={setCantidadRondas} cargando={cargando} error={error} onJugar={() => void jugar()}
        />
      )}
      {paso.tipo === 'pasar' && ronda && (
        <PasarCelu
          key={`${actual}-${paso.jugador}`} ronda={ronda} total={rondas.length} nombre={jugadores[paso.jugador]}
          esImpostor={ronda.impostor === paso.jugador} viendo={paso.viendo}
          onVer={() => setPaso({ ...paso, viendo: true })} onTapar={() => tapar(paso.jugador)}
        />
      )}
      {paso.tipo === 'pistas' && ronda && <Pistas ronda={ronda} total={rondas.length} jugadores={jugadores} onVotar={() => setPaso({ tipo: 'votar' })} />}
      {paso.tipo === 'votar' && ronda && <Votar ronda={ronda} total={rondas.length} onRevelar={() => setPaso({ tipo: 'revelar' })} />}
      {paso.tipo === 'revelar' && ronda && (
        <Revelacion ronda={ronda} jugadores={jugadores} ultima={actual + 1 >= rondas.length} onSiguiente={siguiente} />
      )}
      {paso.tipo === 'final' && (
        <Final
          rondas={rondas} jugadores={jugadores} cargando={cargando} error={error}
          onDeNuevo={() => void jugar()} onCambiar={() => setPaso({ tipo: 'preparar' })}
        />
      )}
    </MultiShell>
  );
}

const Encabezado = ({ ronda, total }: { ronda: RondaEnPersona; total: number }) => (
  <p className="kicker" style={{ textAlign: 'center' }}>El Impostor · Ronda {ronda.numero} de {total}</p>
);

// ── Preparación: nombres, temática y rondas ──
export function Preparacion({ jugadores, setJugadores, tematica, setTematica, rondas, setRondas, cargando, error, onJugar }: {
  jugadores: string[];
  setJugadores: (j: string[]) => void;
  tematica: string;
  setTematica: (t: string) => void;
  rondas: number;
  setRondas: (r: number) => void;
  cargando: boolean;
  error: string | null;
  onJugar: () => void;
}) {
  const [nuevo, setNuevo] = useState('');
  const [aviso, setAviso] = useState<string | null>(null);
  const lleno = jugadores.length >= MAX_JUGADORES;
  const faltan = MIN_JUGADORES - jugadores.length;

  const agregar = (e: FormEvent) => {
    e.preventDefault();
    const problema = errorNombre(nuevo, jugadores);
    setAviso(problema);
    if (problema) return;
    setJugadores([...jugadores, limpiarNombre(nuevo)]);
    setNuevo('');
  };

  return (
    <>
      <div style={{ textAlign: 'center' }}>
        <p className="kicker">El Impostor · En persona</p>
        <h1 className="neon-title" style={{ fontSize: '26px', marginTop: '4px' }}>¿Quiénes juegan?</h1>
        <p className="ep-sub" style={{ marginTop: '4px' }}>
          <Smartphone size={13} style={{ verticalAlign: '-2px' }} /> Un solo celular que se van pasando
        </p>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p className="section-label"><Users size={12} /> Jugadores ({jugadores.length} de {MAX_JUGADORES})</p>
        {jugadores.length > 0 && (
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }} data-testid="ep-jugadores">
            {jugadores.map((j, i) => (
              <li key={j} className="ep-nombre">
                <span>{i + 1}. {j}</span>
                <button type="button" className="ep-x" aria-label={`Sacar a ${j}`} onClick={() => setJugadores(jugadores.filter((x) => x !== j))}>
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
        {!lleno && (
          <form onSubmit={agregar} style={{ display: 'flex', gap: '8px' }}>
            <input
              id="ep-nuevo" className="ep-input" placeholder="Nombre del jugador" maxLength={NOMBRE_MAX} autoComplete="off"
              value={nuevo} onChange={(e) => { setNuevo(e.target.value); setAviso(null); }}
            />
            <button type="submit" className="ep-add" aria-label="Agregar jugador" disabled={!nuevo.trim()}><Plus size={20} /></button>
          </form>
        )}
        {aviso && <p className="error">{aviso}</p>}
        {faltan > 0 && <p className="ep-sub" style={{ fontSize: '12px' }}>Faltan {faltan} {faltan === 1 ? 'jugador' : 'jugadores'} (mínimo {MIN_JUGADORES}).</p>}
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p className="section-label">{config.tematicas!.titulo}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
          {config.tematicas!.opciones.map((o) => (
            <button key={o.id} type="button" className={`option-btn${tematica === o.id ? ' active' : ''}`} onClick={() => setTematica(o.id)}>{o.label}</button>
          ))}
        </div>
        <p className="section-label" style={{ marginTop: '4px' }}>{config.rondas.titulo}</p>
        <div style={{ display: 'flex', gap: '6px' }}>
          {config.rondas.opciones.map((r) => (
            <button key={r} type="button" className={`option-btn${rondas === r ? ' active' : ''}`} onClick={() => setRondas(r)}>{r}</button>
          ))}
        </div>
      </div>

      {error && <p className="error">{error}</p>}
      <button className="main-btn" data-testid="ep-jugar" disabled={faltan > 0 || cargando} onClick={onJugar}>
        <Play size={18} /> {cargando ? 'Preparando…' : '¡Jugar!'}
      </button>
    </>
  );
}

// ── Pasarse el celular: cada uno ve su palabra a su turno ──
// La palabra sólo se dibuja mientras "viendo" es true: al tapar, el siguiente nunca la ve.
export function PasarCelu({ ronda, total, nombre, esImpostor, viendo, onVer, onTapar }: {
  ronda: RondaEnPersona;
  total: number;
  nombre: string;
  esImpostor: boolean;
  viendo: boolean;
  onVer: () => void;
  onTapar: () => void;
}) {
  if (!viendo) {
    return (
      <>
        <Encabezado ronda={ronda} total={total} />
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '28px 20px' }}>
          <Smartphone size={40} color="#39ff8c" style={{ margin: '0 auto' }} />
          <p className="ep-sub">Pasale el celu a</p>
          <p className="ep-titulo" data-testid="ep-pasar-a">{nombre}</p>
          <p className="ep-sub" style={{ fontSize: '12px' }}>Que nadie más mire la pantalla.</p>
          <button className="main-btn" data-testid="ep-ver" onClick={onVer}><Eye size={18} /> Ver mi palabra</button>
        </div>
      </>
    );
  }
  return (
    <>
      <Encabezado ronda={ronda} total={total} />
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '28px 20px' }} data-testid="ep-secreto">
        <p className="ep-sub">{nombre}, tu palabra es:</p>
        {esImpostor ? (
          <>
            <VenetianMask size={44} color={ROJO} style={{ margin: '0 auto' }} />
            <p className="ep-palabra impostor">Sos el impostor</p>
            <p className="ep-sub">Categoría: <strong style={{ color: '#eafff2' }}>{ronda.categoria}</strong>. Escuchá las pistas y disimulá.</p>
          </>
        ) : (
          <>
            <p className="ep-palabra">{ronda.palabra}</p>
            <p className="ep-sub">{ronda.categoria}</p>
          </>
        )}
        <button className="main-btn" data-testid="ep-tapar" onClick={onTapar}><EyeOff size={18} /> Listo, tapar</button>
      </div>
    </>
  );
}

// ── Pistas en voz alta: quién empieza y el orden (dos vueltas) ──
export function Pistas({ ronda, total, jugadores, onVotar }: { ronda: RondaEnPersona; total: number; jugadores: string[]; onVotar: () => void }) {
  const vueltas = ordenPistas(jugadores.length, ronda.empieza);
  return (
    <>
      <Encabezado ronda={ronda} total={total} />
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p className="ep-sub">Empieza</p>
        <p className="ep-titulo" data-testid="ep-empieza">{jugadores[ronda.empieza]}</p>
        <p className="ep-sub">Por turnos, cada uno dice una pista en voz alta. ¡Sin decir la palabra!</p>
        {vueltas.map((vuelta, v) => (
          <div key={v}>
            <p className="section-label">Vuelta {v + 1}</p>
            <ol className="ep-orden">
              {vuelta.map((j, i) => <li key={j} className={v === 0 && i === 0 ? 'primero' : ''}>{i + 1}. {jugadores[j]}</li>)}
            </ol>
          </div>
        ))}
      </div>
      <button className="main-btn" data-testid="ep-a-votar" onClick={onVotar}><Megaphone size={18} /> ¡A votar!</button>
    </>
  );
}

// ── Votación en voz alta ──
export function Votar({ ronda, total, onRevelar }: { ronda: RondaEnPersona; total: number; onRevelar: () => void }) {
  return (
    <>
      <Encabezado ronda={ronda} total={total} />
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '28px 20px' }}>
        <Megaphone size={40} color="#fbbf24" style={{ margin: '0 auto' }} />
        <p className="ep-titulo">Voten en voz alta</p>
        <p className="ep-sub">A la cuenta de tres, todos señalan a quien creen que es el impostor. Si lo descubren, puede intentar adivinar la palabra.</p>
      </div>
      <button className="main-btn" data-testid="ep-revelar" onClick={onRevelar}><Eye size={18} /> Revelar</button>
    </>
  );
}

// ── Revelación: quién era el impostor y cuál era la palabra ──
export function Revelacion({ ronda, jugadores, ultima, onSiguiente }: { ronda: RondaEnPersona; jugadores: string[]; ultima: boolean; onSiguiente: () => void }) {
  return (
    <>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'center', perspective: '600px', padding: '28px 20px' }} data-testid="ep-revelacion">
        <p className="ep-sub">El impostor era</p>
        <div className="ep-revela">
          <VenetianMask size={40} color={ROJO} style={{ margin: '0 auto 6px', display: 'block' }} />
          <p className="ep-palabra impostor">{jugadores[ronda.impostor]}</p>
        </div>
        <div className="ep-revela-2" style={{ marginTop: '10px' }}>
          <p className="ep-sub">La palabra era</p>
          <p className="ep-palabra" style={{ fontSize: 'clamp(26px, 8vw, 40px)' }}>{ronda.palabra}</p>
          <p className="ep-sub">{ronda.categoria}</p>
        </div>
      </div>
      <button className="main-btn" data-testid="ep-siguiente" onClick={onSiguiente}>
        <Play size={18} /> {ultima ? 'Ver el final' : 'Siguiente ronda'}
      </button>
    </>
  );
}

// ── Final: palabra e impostor de cada ronda ──
export function Final({ rondas, jugadores, cargando, error, onDeNuevo, onCambiar }: {
  rondas: RondaEnPersona[];
  jugadores: string[];
  cargando: boolean;
  error: string | null;
  onDeNuevo: () => void;
  onCambiar: () => void;
}) {
  return (
    <>
      <div style={{ textAlign: 'center' }}>
        <p className="kicker">El Impostor · En persona</p>
        <h1 className="neon-title" style={{ fontSize: '26px', marginTop: '4px' }}>¡Terminó la partida!</h1>
      </div>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }} data-testid="ep-final">
        {rondas.map((r) => (
          <div key={r.numero} className="ep-fila">
            <span>
              <span style={{ color: 'rgba(180,255,205,0.6)' }}>Ronda {r.numero}</span><br />
              <strong>{r.palabra}</strong> <span style={{ fontSize: '12px', color: 'rgba(180,255,205,0.6)' }}>({r.categoria})</span>
            </span>
            <span style={{ textAlign: 'right', color: ROJO }}>
              <VenetianMask size={13} style={{ verticalAlign: '-2px' }} /> {jugadores[r.impostor]}
            </span>
          </div>
        ))}
      </div>
      {error && <p className="error">{error}</p>}
      <button className="main-btn" data-testid="ep-de-nuevo" disabled={cargando} onClick={onDeNuevo}>
        <RotateCcw size={18} /> {cargando ? 'Preparando…' : 'Jugar de nuevo'}
      </button>
      <button className="ghost-btn" onClick={onCambiar}>Cambiar jugadores o temática</button>
    </>
  );
}
