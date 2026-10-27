import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight, CircleHelp, type LucideIcon } from 'lucide-react';
import MultiShell from '../../multi/MultiShell';
import BackButton from '../../components/BackButton';
import type { ConfirmText } from '../../components/abandonar';
import { JUEGO_CSS, type PasoComoJugar } from './estilo';

// Piezas comunes de las pantallas de los juegos (estilos en estilo.ts). Las usan todos: El Impostor, Tutti Frutti,
// ahorcado, trivia, sopa, memotest, el desafío del día, el menú de cada juego y las salas.

// Lo que es "fixed" va directo al <body>: si quedara adentro de un contenedor con animación
// (transform), se ubicaría respecto de ese contenedor y no de la pantalla
const alBody = (nodo: ReactNode) => (typeof document === 'undefined' ? nodo : createPortal(nodo, document.body));

// Los estilos van UNA vez por pantalla (los pone PantallaJuego). La barra y las hojas no los repiten: una copia
// más abajo en la página pisaría los estilos propios de un juego (ej. los colores de rol del Impostor).
export const EstilosJuego = () => <style>{JUEGO_CSS}</style>;

export interface Salir {
  to: string;
  confirm?: ConfirmText | null;
  onLeave?: () => Promise<unknown> | unknown;
}

// Pantalla completa con el estilo de la app (cancha de fondo, columna de 480 px): "Volver" arriba a la izquierda,
// "?" a la derecha y la barra con el botón principal fija abajo. Al final queda un espacio del alto de la barra,
// así haciendo scroll se ve todo y la barra nunca tapa nada. Los tableros más anchos van en un .ui-ancho.
export function PantallaJuego({ children, salir, ayuda, barra }: {
  children: ReactNode;
  salir: Salir;
  ayuda?: PasoComoJugar[];
  barra?: ReactNode;
}) {
  return (
    <MultiShell maxWidth={480}>
      <EstilosJuego />
      <BackButton to={salir.to} confirm={salir.confirm ?? null} onLeave={salir.onLeave} />
      {ayuda && <BotonAyuda pasos={ayuda} />}
      {children}
      {barra && <BarraAbajo>{barra}</BarraAbajo>}
    </MultiShell>
  );
}

// "?": abre "Cómo jugar"
export function BotonAyuda({ pasos }: { pasos: PasoComoJugar[] }) {
  const [abierta, setAbierta] = useState(false);
  return alBody(
    <>
      <button type="button" className="ui-ayuda" aria-label="Cómo jugar" data-testid="ui-ayuda" onClick={() => setAbierta(true)}>
        <CircleHelp size={20} />
      </button>
      {abierta && <ComoJugar pasos={pasos} onCerrar={() => setAbierta(false)} />}
    </>,
  );
}

// Barra fija de abajo. "onAlto" avisa cuánto mide (cambia si aparece un aviso arriba del botón).
export function BarraFija({ children, onAlto }: { children: ReactNode; onAlto?: (alto: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !onAlto || typeof ResizeObserver === 'undefined') return;
    const obs = new ResizeObserver(() => onAlto(Math.ceil(el.getBoundingClientRect().height)));
    obs.observe(el);
    return () => obs.disconnect();
  }, [onAlto]);
  return alBody(
    <div ref={ref} className="ui-barra" data-testid="ui-barra">
      <div>{children}</div>
    </div>,
  );
}

// La barra fija más un espacio, en su lugar, del mismo alto que ella: va al final de la pantalla para que lo último
// no quede tapado por la barra.
export function BarraAbajo({ children }: { children: ReactNode }) {
  const [alto, setAlto] = useState(96);
  return (
    <>
      <div aria-hidden="true" data-testid="ui-espacio-barra" style={{ height: `${alto}px`, flexShrink: 0 }} />
      <BarraFija onAlto={setAlto}>{children}</BarraFija>
    </>
  );
}

// Hoja que sube desde abajo (se cierra tocando afuera, con Escape o con su botón). Al abrirse el foco va a la
// hoja misma (sin scrollear: así se lee desde el título) y el botón de cerrar queda siempre a la vista abajo.
export function Hoja({ titulo, onCerrar, children, cerrar = 'Cerrar' }: { titulo: string; onCerrar: () => void; children: ReactNode; cerrar?: string }) {
  const hoja = useRef<HTMLDivElement>(null);
  useEffect(() => hoja.current?.focus({ preventScroll: true }), []);
  return alBody(
    <div className="ui-velo" role="presentation" onClick={onCerrar} onKeyDown={(e) => e.key === 'Escape' && onCerrar()}>
      <div ref={hoja} tabIndex={-1} className="ui-hoja" role="dialog" aria-modal="true" aria-label={titulo} onClick={(e) => e.stopPropagation()}>
        <div className="ui-hoja-manija" />
        <h2 className="neon-title ui-titulo" style={{ fontSize: '26px' }}>{titulo}</h2>
        {children}
        <div className="ui-hoja-pie">
          <button type="button" className="ui-boton" onClick={onCerrar}>{cerrar}</button>
        </div>
      </div>
    </div>,
  );
}

// "Cómo jugar": pasos con ícono y título de color
export function ComoJugar({ pasos, onCerrar }: { pasos: PasoComoJugar[]; onCerrar: () => void }) {
  return (
    <Hoja titulo="Cómo jugar" onCerrar={onCerrar}>
      <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px', margin: 0, padding: 0 }} data-testid="ui-como-jugar">
        {pasos.map(({ icono: Icono, color, titulo, texto }, i) => (
          <li key={titulo} className="ui-paso">
            <span className="ui-paso-icono" style={{ background: `${color}1f`, border: `1px solid ${color}66`, color, boxShadow: `0 0 12px ${color}33` }}>
              <Icono size={22} />
            </span>
            <div>
              <p className="kicker" style={{ fontSize: '11px' }}>Paso {i + 1}</p>
              <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: '19px', fontWeight: 700, color, textTransform: 'uppercase', lineHeight: 1.15, textShadow: `0 0 14px ${color}55` }}>
                {titulo}
              </p>
              <p style={{ fontSize: '14px', lineHeight: 1.5, color: 'rgba(180,255,205,0.8)', marginTop: '2px' }}>{texto}</p>
            </div>
          </li>
        ))}
      </ol>
    </Hoja>
  );
}

export interface OpcionSelector {
  id: string;
  label: string;
  sub?: string; // una línea más chica debajo (ej. qué tiene cada dificultad)
}

// Selector en una hoja: una opción por fila, la elegida iluminada
export function Selector({ titulo, opciones, valor, onElegir, onCerrar }: {
  titulo: string;
  opciones: OpcionSelector[];
  valor: string;
  onElegir: (id: string) => void;
  onCerrar: () => void;
}) {
  return (
    <Hoja titulo={titulo} onCerrar={onCerrar}>
      <div role="radiogroup" aria-label={titulo} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {opciones.map((o) => (
          <button key={o.id} type="button" role="radio" aria-checked={o.id === valor} className={`ui-opcion${o.id === valor ? ' activo' : ''}`} onClick={() => onElegir(o.id)}>
            {o.sub ? <span>{o.label}<span className="ui-fila-sub">{o.sub}</span></span> : o.label}
          </button>
        ))}
      </div>
    </Hoja>
  );
}

// Fila de la lista de ajustes: ícono a la izquierda, nombre (y una línea más chica) y el valor a la derecha. Con
// onClick es un botón (con la flechita); sin onClick sólo muestra el valor.
export function FilaAjuste({ icono: Icono, nombre, sub, valor, onClick, testid }: {
  icono: LucideIcon;
  nombre: ReactNode;
  sub?: ReactNode;
  valor?: ReactNode;
  onClick?: () => void;
  testid?: string;
}) {
  const contenido = (
    <>
      <span className="ui-fila-icono"><Icono size={19} /></span>
      <span className="ui-fila-nombre">{nombre}{sub && <span className="ui-fila-sub">{sub}</span>}</span>
      {(valor !== undefined || onClick) && <span className="ui-fila-valor">{valor}{onClick && <ChevronRight size={20} />}</span>}
    </>
  );
  return onClick
    ? <button type="button" className="ui-fila" data-testid={testid} onClick={onClick}>{contenido}</button>
    : <div className="ui-fila" data-testid={testid}>{contenido}</div>;
}

// Un ajuste que se elige de una lista: la fila muestra lo elegido y al tocarla abre el selector. "deshabilitado"
// sólo muestra el valor (ej. en la sala, si no sos el anfitrión). Sin nada elegido dice "Elegí".
export function AjusteElegible({ icono, titulo, opciones, valor, onElegir, deshabilitado = false, sub, testid }: {
  icono: LucideIcon;
  titulo: string;
  opciones: OpcionSelector[];
  valor: string;
  onElegir: (id: string) => void;
  deshabilitado?: boolean;
  sub?: ReactNode;
  testid?: string;
}) {
  const [abierto, setAbierto] = useState(false);
  const elegida = opciones.find((o) => o.id === valor);
  return (
    <>
      <FilaAjuste icono={icono} nombre={titulo} sub={sub ?? elegida?.sub} valor={elegida?.label ?? 'Elegí'} testid={testid}
        onClick={deshabilitado ? undefined : () => setAbierto(true)} />
      {abierto && (
        <Selector titulo={titulo} opciones={opciones} valor={valor} onCerrar={() => setAbierto(false)}
          onElegir={(id) => { onElegir(id); setAbierto(false); }} />
      )}
    </>
  );
}

// Encabezado de una pantalla: rótulo chico, el ícono del juego en un círculo con brillo, el título y una línea
export function Encabezado({ icono: Icono, kicker, titulo, texto }: { icono?: LucideIcon; kicker?: ReactNode; titulo: ReactNode; texto?: ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {kicker && <div className="kicker ui-centro">{kicker}</div>}
      {Icono && <span className="ui-icono-juego" aria-hidden="true"><Icono size={36} strokeWidth={1.6} /></span>}
      <h1 className="neon-title ui-titulo">{titulo}</h1>
      {texto && <p className="ui-texto">{texto}</p>}
    </div>
  );
}
