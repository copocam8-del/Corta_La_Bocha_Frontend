import { useEffect, useRef, useState, type FormEvent, type PointerEvent } from 'react';
import { isAxiosError } from 'axios';
import {
  ChevronRight, ChevronsUp, Eye, Lightbulb, Megaphone, Minus, Play, Plus, Repeat, RotateCcw, Shapes, SlidersHorizontal, Timer, Users,
  VenetianMask, X,
} from 'lucide-react';
import { SALIR_EN_PERSONA } from '../components/abandonar';
import { menuPath, MULTI_CONFIG } from '../games/multiConfig';
import { pedirPalabrasEnPersona } from '../api/impostor';
import {
  ajustarImpostores, armarRondas, errorNombre, guardarAjustes, guardarNombres, leerAjustes, leerNombresGuardados, limpiarNombre,
  MAX_JUGADORES, maxImpostores, MIN_JUGADORES, NOMBRE_MAX, ordenPistas, secretoDe, VUELTAS, type AjustesEnPersona, type RondaEnPersona,
  type Secreto,
} from '../games/impostor/presencial';
import { AMARILLO, CELESTE, COMO_JUGAR_EN_PERSONA, ROJO, VERDE } from '../games/impostor/estilo';
import { Hinchas, Hoja, PantallaImpostor } from '../games/impostor/ImpostorUI';

// El Impostor "En persona" (/juego/impostor/en-persona): un solo celular que se pasan. Se arma la partida
// (jugadores, impostores, pista, temática y rondas), el backend da las palabras y todo lo demás pasa acá:
// cada uno desliza la tarjeta para ver su palabra (o que es impostor), las pistas y la votación son en voz
// alta y al final se revela. No cuenta para estadísticas ni logros. Pensado primero para el celular.

const config = MULTI_CONFIG.impostor;
const SALIR = menuPath('impostor');

type Paso =
  | { tipo: 'preparar' }
  | { tipo: 'pasar'; jugador: number; viendo: boolean }
  | { tipo: 'pistas' }
  | { tipo: 'votar' }
  | { tipo: 'revelar' }
  | { tipo: 'final' };

const sinAnimacion = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export default function ImpostorPresencial() {
  const [jugadores, setJugadores] = useState<string[]>(() => leerNombresGuardados());
  const [tematica, setTematica] = useState(config.defaults.tematica);
  const [cantidadRondas, setCantidadRondas] = useState(config.defaults.rounds);
  const [ajustes, setAjustes] = useState<AjustesEnPersona>(() => leerAjustes());
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
    const impostores = ajustarImpostores(ajustes.impostores, jugadores.length);
    guardarNombres(jugadores);
    guardarAjustes({ ...ajustes, impostores });
    try {
      const palabras = await pedirPalabrasEnPersona(tematica, cantidadRondas);
      setRondas(armarRondas(jugadores.length, palabras, impostores));
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

  const siguienteJugador = (jugador: number) =>
    setPaso(jugador + 1 < jugadores.length ? { tipo: 'pasar', jugador: jugador + 1, viendo: false } : { tipo: 'pistas' });

  const siguienteRonda = () => {
    if (actual + 1 < rondas.length) {
      setActual(actual + 1);
      setPaso({ tipo: 'pasar', jugador: 0, viendo: false });
    } else {
      setPaso({ tipo: 'final' });
    }
  };

  const enPartida = paso.tipo !== 'preparar' && paso.tipo !== 'final';
  const salir = { to: SALIR, confirm: enPartida ? SALIR_EN_PERSONA : null };

  if (paso.tipo === 'pasar' && ronda) {
    return (
      <PasarCelu
        key={`${actual}-${paso.jugador}`} ronda={ronda} total={rondas.length} nombre={jugadores[paso.jugador]}
        secreto={secretoDe(ronda, paso.jugador, ajustes.pista)} viendo={paso.viendo} ultimo={paso.jugador + 1 >= jugadores.length}
        salir={salir} onVer={() => setPaso({ ...paso, viendo: true })} onSiguiente={() => siguienteJugador(paso.jugador)}
      />
    );
  }
  if (paso.tipo === 'pistas' && ronda) return <Pistas ronda={ronda} total={rondas.length} jugadores={jugadores} salir={salir} onVotar={() => setPaso({ tipo: 'votar' })} />;
  if (paso.tipo === 'votar' && ronda) return <Votar ronda={ronda} total={rondas.length} salir={salir} onRevelar={() => setPaso({ tipo: 'revelar' })} />;
  if (paso.tipo === 'revelar' && ronda) {
    return <Revelacion ronda={ronda} total={rondas.length} jugadores={jugadores} ultima={actual + 1 >= rondas.length} salir={salir} onSiguiente={siguienteRonda} />;
  }
  if (paso.tipo === 'final') {
    return (
      <Final
        rondas={rondas} jugadores={jugadores} cargando={cargando} error={error} salir={salir}
        onDeNuevo={() => void jugar()} onCambiar={() => setPaso({ tipo: 'preparar' })}
      />
    );
  }
  return (
    <Configuracion
      jugadores={jugadores} setJugadores={setJugadores} ajustes={ajustes} setAjustes={setAjustes}
      tematica={tematica} setTematica={setTematica} rondas={cantidadRondas} setRondas={setCantidadRondas}
      cargando={cargando} error={error} onJugar={() => void jugar()}
    />
  );
}

type Salir = { to: string; confirm: typeof SALIR_EN_PERSONA | null };

const RondaDe = ({ ronda, total }: { ronda: RondaEnPersona; total: number }) => (
  <p className="imp-chiquito">Ronda {ronda.numero} de {total}</p>
);

// ── 1. Configuración: lista de ajustes ──
export function Configuracion({ jugadores, setJugadores, ajustes, setAjustes, tematica, setTematica, rondas, setRondas, cargando, error, onJugar }: {
  jugadores: string[];
  setJugadores: (j: string[]) => void;
  ajustes: AjustesEnPersona;
  setAjustes: (a: AjustesEnPersona) => void;
  tematica: string;
  setTematica: (t: string) => void;
  rondas: number;
  setRondas: (r: number) => void;
  cargando: boolean;
  error: string | null;
  onJugar: () => void;
}) {
  const [hoja, setHoja] = useState<'jugadores' | 'tematica' | 'rondas' | null>(null);
  const faltan = MIN_JUGADORES - jugadores.length;
  const maximo = maxImpostores(jugadores.length);
  const impostores = ajustarImpostores(ajustes.impostores, jugadores.length);
  const cambiarImpostores = (n: number) => setAjustes({ ...ajustes, impostores: ajustarImpostores(n, jugadores.length) });
  const tematicaLabel = config.tematicas!.opciones.find((o) => o.id === tematica)?.label ?? tematica;

  return (
    <PantallaImpostor
      salir={{ to: SALIR }} ayuda={COMO_JUGAR_EN_PERSONA}
      barra={
        <>
          {faltan > 0 && <p className="imp-barra-nota">Faltan {faltan} {faltan === 1 ? 'jugador' : 'jugadores'} (mínimo {MIN_JUGADORES}).</p>}
          <button type="button" className="imp-boton" data-testid="ep-jugar" disabled={faltan > 0 || cargando} onClick={onJugar}>
            <Play size={22} fill="currentColor" /> {cargando ? 'Preparando…' : 'Iniciar juego'}
          </button>
        </>
      }
    >
      <div className="imp-entra" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <Hinchas />
        <h1 className="imp-titulo">El Impostor</h1>
        <p className="imp-texto" style={{ fontSize: '15px' }}>En persona · un solo celular que se van pasando</p>
      </div>

      <div className="imp-lista imp-entra" data-testid="ep-ajustes">
        <button type="button" className="imp-fila" onClick={() => setHoja('jugadores')} data-testid="ep-fila-jugadores">
          <span className="imp-fila-icono" style={{ background: 'rgba(57,255,140,0.14)', color: VERDE }}><Users size={22} /></span>
          <span className="imp-fila-nombre">Jugadores</span>
          <span className="imp-fila-valor">{jugadores.length} <ChevronRight size={20} /></span>
        </button>

        <div className="imp-fila">
          <span className="imp-fila-icono" style={{ background: 'rgba(248,113,113,0.16)', color: ROJO }}><VenetianMask size={22} /></span>
          <span className="imp-fila-nombre">Impostores</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button type="button" className="imp-chico" aria-label="Menos impostores" disabled={impostores <= 1} onClick={() => cambiarImpostores(impostores - 1)}>
              <Minus size={18} />
            </button>
            <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '22px', minWidth: '18px', textAlign: 'center' }} data-testid="ep-impostores" aria-live="polite">
              {impostores}
            </span>
            <button type="button" className="imp-chico" aria-label="Más impostores" disabled={impostores >= maximo} onClick={() => cambiarImpostores(impostores + 1)}>
              <Plus size={18} />
            </button>
          </span>
        </div>

        <button type="button" className="imp-fila" role="switch" aria-checked={ajustes.pista} data-testid="ep-pista"
          onClick={() => setAjustes({ ...ajustes, pista: !ajustes.pista })}>
          <span className="imp-fila-icono" style={{ background: 'rgba(251,191,36,0.16)', color: AMARILLO }}><Lightbulb size={22} /></span>
          <span className="imp-fila-nombre">
            Pista para el impostor
            <span style={{ display: 'block', fontSize: '13px', fontWeight: 400, color: 'rgba(200,255,220,0.6)' }}>
              {ajustes.pista ? 'Ve la categoría' : 'No ve nada'}
            </span>
          </span>
          <span className={`imp-switch${ajustes.pista ? ' on' : ''}`} aria-hidden="true" />
        </button>

        <button type="button" className="imp-fila" onClick={() => setHoja('tematica')}>
          <span className="imp-fila-icono" style={{ background: 'rgba(94,203,255,0.16)', color: CELESTE }}><Shapes size={22} /></span>
          <span className="imp-fila-nombre">Temática</span>
          <span className="imp-fila-valor">{tematicaLabel} <ChevronRight size={20} /></span>
        </button>

        <button type="button" className="imp-fila" onClick={() => setHoja('rondas')}>
          <span className="imp-fila-icono" style={{ background: 'rgba(57,255,140,0.14)', color: VERDE }}><Repeat size={22} /></span>
          <span className="imp-fila-nombre">Rondas</span>
          <span className="imp-fila-valor">{rondas} <ChevronRight size={20} /></span>
        </button>
      </div>

      {error && <p className="error" role="alert">{error}</p>}

      {hoja === 'jugadores' && <HojaJugadores jugadores={jugadores} setJugadores={setJugadores} onCerrar={() => setHoja(null)} />}
      {hoja === 'tematica' && (
        <Selector titulo={config.tematicas!.titulo} opciones={config.tematicas!.opciones} valor={tematica}
          onElegir={(v) => { setTematica(v); setHoja(null); }} onCerrar={() => setHoja(null)} />
      )}
      {hoja === 'rondas' && (
        <Selector titulo={config.rondas.titulo} opciones={config.rondas.opciones.map((r) => ({ id: String(r), label: `${r} ${r === 1 ? 'ronda' : 'rondas'}` }))}
          valor={String(rondas)} onElegir={(v) => { setRondas(Number(v)); setHoja(null); }} onCerrar={() => setHoja(null)} />
      )}
    </PantallaImpostor>
  );
}

// Lista de jugadores: agregar y sacar nombres
export function HojaJugadores({ jugadores, setJugadores, onCerrar }: { jugadores: string[]; setJugadores: (j: string[]) => void; onCerrar: () => void }) {
  const [nuevo, setNuevo] = useState('');
  const [aviso, setAviso] = useState<string | null>(null);
  const lleno = jugadores.length >= MAX_JUGADORES;

  const agregar = (e: FormEvent) => {
    e.preventDefault();
    const problema = errorNombre(nuevo, jugadores);
    setAviso(problema);
    if (problema) return;
    setJugadores([...jugadores, limpiarNombre(nuevo)]);
    setNuevo('');
  };

  return (
    <Hoja titulo={`Jugadores (${jugadores.length})`} onCerrar={onCerrar} cerrar="Listo">
      <p className="imp-texto" style={{ fontSize: '14px' }}>De {MIN_JUGADORES} a {MAX_JUGADORES}. El celular se pasa en este orden.</p>
      {!lleno && (
        <form onSubmit={agregar} style={{ display: 'flex', gap: '8px' }}>
          <input
            id="ep-nuevo" aria-label="Nombre del jugador" placeholder="Nombre del jugador" maxLength={NOMBRE_MAX} autoComplete="off"
            value={nuevo} onChange={(e) => { setNuevo(e.target.value); setAviso(null); }}
            style={{ flex: 1, minWidth: 0, minHeight: '54px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.14)',
              background: 'rgba(255,255,255,0.06)', color: '#eefff4', padding: '0 16px', fontSize: '17px', outline: 'none' }}
          />
          <button type="submit" className="imp-chico" aria-label="Agregar jugador" disabled={!nuevo.trim()} style={{ minWidth: '54px', borderRadius: '16px' }}>
            <Plus size={22} />
          </button>
        </form>
      )}
      {aviso && <p className="error" role="alert">{aviso}</p>}
      {jugadores.length > 0 && (
        <ol className="imp-lista" style={{ listStyle: 'none', margin: 0, padding: 0 }} data-testid="ep-jugadores">
          {jugadores.map((j, i) => (
            <li key={j} className="imp-fila" style={{ minHeight: '56px' }}>
              <span style={{ width: '28px', color: 'rgba(200,255,220,0.5)', fontFamily: "'Oswald', sans-serif", fontSize: '18px' }}>{i + 1}</span>
              <span className="imp-fila-nombre" style={{ overflowWrap: 'anywhere' }}>{j}</span>
              <button type="button" className="imp-chico" aria-label={`Sacar a ${j}`} onClick={() => setJugadores(jugadores.filter((x) => x !== j))}>
                <X size={18} />
              </button>
            </li>
          ))}
        </ol>
      )}
    </Hoja>
  );
}

function Selector({ titulo, opciones, valor, onElegir, onCerrar }: {
  titulo: string;
  opciones: { id: string; label: string }[];
  valor: string;
  onElegir: (id: string) => void;
  onCerrar: () => void;
}) {
  return (
    <Hoja titulo={titulo} onCerrar={onCerrar}>
      <div role="radiogroup" aria-label={titulo} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {opciones.map((o) => (
          <button key={o.id} type="button" role="radio" aria-checked={o.id === valor} className={`imp-opcion${o.id === valor ? ' activo' : ''}`} onClick={() => onElegir(o.id)}>
            {o.label}
          </button>
        ))}
      </div>
    </Hoja>
  );
}

// ── 2. Pasar el celu: cada uno desliza la tarjeta para ver su palabra ──
// El secreto sólo se dibuja mientras ese jugador levanta la tarjeta: al tocar "Jugador siguiente" se
// tapa todo y el siguiente arranca con una pantalla nueva (key distinta), sin nada del anterior.
const ALTO = 420; // alto de la zona de la tarjeta
const SUBE = 286; // cuánto sube la tarjeta al abrirse (deja ver el rol abajo)
const UMBRAL = 90; // cuánto hay que deslizar para abrirla

export function PasarCelu({ ronda, total, nombre, secreto, viendo, ultimo, salir, onVer, onSiguiente }: {
  ronda: RondaEnPersona;
  total: number;
  nombre: string;
  secreto: Secreto;
  viendo: boolean;
  ultimo: boolean;
  salir: Salir;
  onVer: () => void;
  onSiguiente: () => void;
}) {
  const [arrastre, setArrastre] = useState(0);
  const [tapando, setTapando] = useState(false);
  const [arrastrando, setArrastrando] = useState(false);
  const inicio = useRef<number | null>(null);
  const abierta = viendo && !tapando;
  const sube = tapando ? 0 : viendo ? SUBE : arrastre;
  const muestraSecreto = abierta || (!tapando && arrastre > 0);

  const bajar = (e: PointerEvent<HTMLDivElement>) => {
    if (viendo) return;
    inicio.current = e.clientY;
    setArrastrando(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const mover = (e: PointerEvent<HTMLDivElement>) => {
    if (inicio.current === null) return;
    setArrastre(Math.max(0, Math.min(SUBE, inicio.current - e.clientY)));
  };
  const soltar = () => {
    if (inicio.current === null) return;
    inicio.current = null;
    setArrastrando(false);
    if (arrastre >= UMBRAL) onVer();
    setArrastre(0);
  };
  const siguiente = () => {
    setTapando(true);
    // Primero baja la tarjeta (se tapa todo) y recién después aparece el nombre del siguiente
    if (sinAnimacion()) onSiguiente();
    else window.setTimeout(onSiguiente, 320);
  };

  return (
    <PantallaImpostor
      salir={salir} ayuda={COMO_JUGAR_EN_PERSONA}
      barra={abierta ? (
        <>
          <p className="imp-barra-nota">Tapá y pasá al siguiente jugador</p>
          <button type="button" className="imp-boton" data-testid="ep-siguiente-jugador" onClick={siguiente}>
            {ultimo ? <><Megaphone size={22} /> ¡A dar pistas!</> : <>Jugador siguiente <ChevronRight size={22} /></>}
          </button>
        </>
      ) : (
        <button type="button" className="imp-boton secundario" data-testid="ep-ver" disabled={tapando} onClick={onVer}>
          <Eye size={20} /> Ver mi palabra
        </button>
      )}
    >
      <RondaDe ronda={ronda} total={total} />
      <div style={{ textAlign: 'center' }}>
        <p className="imp-chiquito">Jugador</p>
        <p className="imp-gigante" data-testid="ep-pasar-a">{nombre}</p>
      </div>

      <div style={{ position: 'relative', height: `${ALTO}px`, overflow: 'hidden', borderRadius: '24px' }}>
        {/* El rol, debajo de la tarjeta */}
        {muestraSecreto && (
          <div data-testid="ep-secreto" aria-hidden={!abierta} aria-live="polite"
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: `${SUBE}px`, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 16px', textAlign: 'center' }}>
            <Rol secreto={secreto} />
          </div>
        )}
        {/* La tarjeta: se desliza hacia arriba */}
        <div
          className="imp-tarjeta" data-testid="ep-tarjeta" onPointerDown={bajar} onPointerMove={mover} onPointerUp={soltar} onPointerCancel={soltar}
          style={{
            position: 'absolute', inset: 0, borderRadius: '24px', touchAction: 'none', userSelect: 'none', cursor: viendo ? 'default' : 'grab',
            background: 'linear-gradient(180deg, #123a24 0%, #0b2416 100%)', border: '1px solid rgba(57,255,140,0.28)',
            boxShadow: '0 24px 50px -18px rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'space-between', padding: '28px 20px 22px',
            transform: `translateY(-${sube}px)`, transition: arrastrando ? 'none' : 'transform 0.32s cubic-bezier(.2,.9,.3,1)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <ChevronsUp size={34} color={VERDE} />
            <p className="imp-texto" style={{ fontSize: '17px', maxWidth: '280px' }}>Deslizá la tarjeta hacia arriba para ver tu palabra</p>
            <p style={{ fontSize: '13px', color: 'rgba(200,255,220,0.5)' }}>Que nadie más mire la pantalla</p>
          </div>
          <Hinchas chico />
        </div>
      </div>
    </PantallaImpostor>
  );
}

// Lo que ve cada uno: impostor (rojo, sin palabra) o hincha (su color, con la palabra)
function Rol({ secreto }: { secreto: Secreto }) {
  if (secreto.rol === 'impostor') {
    return (
      <>
        <span style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(248,113,113,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <VenetianMask size={36} color={ROJO} />
        </span>
        <p className="imp-gigante" style={{ color: ROJO }}>Impostor</p>
        <p className="imp-texto" style={{ fontSize: '18px', color: '#eefff4' }}>No tenés palabra</p>
        {secreto.categoria
          ? <p className="imp-texto">Pista: <strong style={{ color: AMARILLO }}>{secreto.categoria}</strong></p>
          : <p className="imp-texto" style={{ fontSize: '14px' }}>Sin pista: escuchá bien a los demás</p>}
        {secreto.companeros > 0 && (
          <p style={{ fontSize: '13px', color: 'rgba(255,200,200,0.75)' }}>
            Hay {secreto.companeros === 1 ? 'otro impostor' : `otros ${secreto.companeros} impostores`} (no sabés quién)
          </p>
        )}
      </>
    );
  }
  return (
    <>
      <span style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(94,203,255,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Users size={28} color={CELESTE} />
      </span>
      <p style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 700, fontSize: '22px', letterSpacing: '3px', color: CELESTE, textTransform: 'uppercase' }}>Hincha</p>
      <p className="imp-texto" style={{ fontSize: '15px' }}>Tu palabra es:</p>
      <p className="imp-gigante" style={{ color: '#eefff4', fontSize: 'clamp(32px, 10vw, 48px)' }}>{secreto.palabra}</p>
      <p style={{ fontSize: '14px', color: 'rgba(200,255,220,0.6)' }}>{secreto.categoria}</p>
    </>
  );
}

// ── 3. Orden de las pistas (en voz alta) ──
export function Pistas({ ronda, total, jugadores, salir, onVotar }: { ronda: RondaEnPersona; total: number; jugadores: string[]; salir: Salir; onVotar: () => void }) {
  const [vuelta] = ordenPistas(jugadores.length, ronda.empieza);
  return (
    <PantallaImpostor
      salir={salir} ayuda={COMO_JUGAR_EN_PERSONA}
      barra={<button type="button" className="imp-boton" data-testid="ep-a-votar" onClick={onVotar}><Megaphone size={22} /> ¡A votar!</button>}
    >
      <RondaDe ronda={ronda} total={total} />
      <div className="imp-entra" style={{ textAlign: 'center' }}>
        <p className="imp-chiquito">Empieza</p>
        <p className="imp-gigante" style={{ color: VERDE }} data-testid="ep-empieza">{jugadores[ronda.empieza]}</p>
      </div>
      <p className="imp-texto">Por turnos, cada uno dice una pista en voz alta. ¡Sin decir la palabra! Son {VUELTAS} vueltas.</p>
      <ol className="imp-lista imp-entra" style={{ listStyle: 'none', margin: 0, padding: 0 }} data-testid="ep-orden">
        {vuelta.map((j, i) => (
          <li key={j} className="imp-fila" style={{ minHeight: '56px' }}>
            <span className="imp-fila-icono" style={{
              background: i === 0 ? VERDE : 'rgba(255,255,255,0.08)', color: i === 0 ? '#03200f' : '#eefff4',
              fontFamily: "'Oswald', sans-serif", fontSize: '18px', fontWeight: 700,
            }}>{i + 1}</span>
            <span className="imp-fila-nombre" style={{ overflowWrap: 'anywhere' }}>{jugadores[j]}</span>
          </li>
        ))}
      </ol>
    </PantallaImpostor>
  );
}

// ── 4. Votación en voz alta, con un reloj opcional ──
const RELOJES = [0, 30, 60];

export function Votar({ ronda, total, salir, onRevelar }: { ronda: RondaEnPersona; total: number; salir: Salir; onRevelar: () => void }) {
  const [segundos, setSegundos] = useState(0);
  return (
    <PantallaImpostor
      salir={salir} ayuda={COMO_JUGAR_EN_PERSONA}
      barra={<button type="button" className="imp-boton" data-testid="ep-revelar" onClick={onRevelar}><Eye size={22} /> Revelar</button>}
    >
      <RondaDe ronda={ronda} total={total} />
      <div className="imp-bloque imp-entra" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '28px 20px' }}>
        <span style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(251,191,36,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Megaphone size={38} color={AMARILLO} />
        </span>
        <p className="imp-titulo">Voten en voz alta</p>
        <p className="imp-texto">
          {ronda.impostores.length > 1
            ? `A la cuenta de tres, todos señalan a quien creen que es impostor (hay ${ronda.impostores.length}). Si descubren a uno, puede intentar adivinar la palabra.`
            : 'A la cuenta de tres, todos señalan a quien creen que es el impostor. Si lo descubren, puede intentar adivinar la palabra.'}
        </p>
      </div>
      <div className="imp-bloque imp-entra" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <p className="imp-chiquito" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}><Timer size={15} /> Reloj (opcional)</p>
        <div style={{ display: 'flex', gap: '8px' }} role="radiogroup" aria-label="Reloj">
          {RELOJES.map((s) => (
            <button key={s} type="button" role="radio" aria-checked={segundos === s} className={`imp-chico${segundos === s ? ' activo' : ''}`} style={{ flex: 1 }}
              onClick={() => setSegundos(s)}>
              {s ? `${s} s` : 'Sin reloj'}
            </button>
          ))}
        </div>
        {segundos > 0 && <Reloj key={segundos} segundos={segundos} />}
      </div>
    </PantallaImpostor>
  );
}

// Cuenta regresiva. Arranca de nuevo cada vez que se elige otro tiempo (key) y se calcula contra la hora de
// fin (no restando de a 1), así no se atrasa si el celu se traba.
function Reloj({ segundos }: { segundos: number }) {
  const [quedan, setQuedan] = useState(segundos);
  useEffect(() => {
    const fin = Date.now() + segundos * 1000;
    const t = window.setInterval(() => setQuedan(Math.max(0, Math.ceil((fin - Date.now()) / 1000))), 250);
    return () => window.clearInterval(t);
  }, [segundos]);
  return (
    <p data-testid="ep-reloj" role="timer" aria-live="off" style={{
      fontFamily: "'Oswald', sans-serif", fontSize: '64px', fontWeight: 700, textAlign: 'center', lineHeight: 1,
      color: quedan <= 5 ? ROJO : '#eefff4',
    }}>{quedan === 0 ? '¡Tiempo!' : quedan}</p>
  );
}

// ── 5. Revelación: quiénes eran los impostores y la palabra ──
export function Revelacion({ ronda, total, jugadores, ultima, salir, onSiguiente }: {
  ronda: RondaEnPersona;
  total: number;
  jugadores: string[];
  ultima: boolean;
  salir: Salir;
  onSiguiente: () => void;
}) {
  const varios = ronda.impostores.length > 1;
  return (
    <PantallaImpostor
      salir={salir} ayuda={COMO_JUGAR_EN_PERSONA}
      barra={
        <button type="button" className="imp-boton" data-testid="ep-siguiente" onClick={onSiguiente}>
          <Play size={22} fill="currentColor" /> {ultima ? 'Ver final' : 'Siguiente ronda'}
        </button>
      }
    >
      <RondaDe ronda={ronda} total={total} />
      <div className="imp-bloque" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', textAlign: 'center', perspective: '700px', padding: '28px 20px' }} data-testid="ep-revelacion">
        <p className="imp-chiquito">{varios ? 'Los impostores eran' : 'El impostor era'}</p>
        <div className="imp-revela" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <VenetianMask size={46} color={ROJO} />
          {ronda.impostores.map((i) => <p key={i} className="imp-gigante" style={{ color: ROJO }}>{jugadores[i]}</p>)}
        </div>
      </div>
      <div className="imp-bloque imp-revela-2" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <p className="imp-chiquito">La palabra era</p>
        <p className="imp-titulo" style={{ color: CELESTE }}>{ronda.palabra}</p>
        <p style={{ fontSize: '14px', color: 'rgba(200,255,220,0.6)' }}>{ronda.categoria}</p>
      </div>
    </PantallaImpostor>
  );
}

// ── Final: palabra e impostores de cada ronda ──
export function Final({ rondas, jugadores, cargando, error, salir, onDeNuevo, onCambiar }: {
  rondas: RondaEnPersona[];
  jugadores: string[];
  cargando: boolean;
  error: string | null;
  salir: Salir;
  onDeNuevo: () => void;
  onCambiar: () => void;
}) {
  return (
    <PantallaImpostor
      salir={salir} ayuda={COMO_JUGAR_EN_PERSONA}
      barra={
        <>
          <button type="button" className="imp-boton" data-testid="ep-de-nuevo" disabled={cargando} onClick={onDeNuevo}>
            <RotateCcw size={22} /> {cargando ? 'Preparando…' : 'Jugar de nuevo'}
          </button>
          <button type="button" className="imp-boton secundario" onClick={onCambiar}><SlidersHorizontal size={18} /> Cambiar ajustes</button>
        </>
      }
    >
      <div className="imp-entra" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <Hinchas chico />
        <h1 className="imp-titulo">¡Terminó la partida!</h1>
      </div>
      <div className="imp-lista" data-testid="ep-final">
        {rondas.map((r) => (
          <div key={r.numero} className="imp-fila" style={{ alignItems: 'flex-start' }}>
            <span className="imp-fila-icono" style={{ background: 'rgba(255,255,255,0.08)', fontFamily: "'Oswald', sans-serif", fontSize: '18px', fontWeight: 700 }}>{r.numero}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ fontSize: '17px', color: CELESTE }}>{r.palabra}</strong>
              <span style={{ display: 'block', fontSize: '13px', color: 'rgba(200,255,220,0.55)' }}>{r.categoria}</span>
            </span>
            <span style={{ textAlign: 'right', color: ROJO, fontSize: '15px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {r.impostores.map((i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px', whiteSpace: 'nowrap' }}>
                  <VenetianMask size={15} /> {jugadores[i]}
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>
      {error && <p className="error" role="alert">{error}</p>}
    </PantallaImpostor>
  );
}
