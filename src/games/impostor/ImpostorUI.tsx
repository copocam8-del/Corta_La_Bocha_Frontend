import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CircleHelp, Megaphone, Smartphone, Trophy, Users, VenetianMask, Vote } from 'lucide-react';
import MultiShell from '../../multi/MultiShell';
import BackButton from '../../components/BackButton';
import type { ConfirmText } from '../../components/abandonar';
import { hinchaRecortado, HINCHAS_PORTADA, IMPOSTOR_CSS, type PasoComoJugar } from './estilo';

// Piezas comunes de las pantallas de El Impostor (estilos en estilo.ts).

// Lo que es "fixed" va directo al <body>: si quedara adentro de un contenedor con animación
// (transform), se ubicaría respecto de ese contenedor y no de la pantalla
const alBody = (nodo: ReactNode) => (typeof document === 'undefined' ? nodo : createPortal(nodo, document.body));

export const EstilosImpostor = () => <style>{IMPOSTOR_CSS}</style>;

// Pantalla completa con el estilo de la app (cancha de fondo, columna de 480 px): "Volver" arriba a la izquierda,
// "?" a la derecha y la barra con el botón principal fija abajo. Al final queda un espacio del alto de la barra,
// así haciendo scroll se ve todo y la barra nunca tapa nada.
export function PantallaImpostor({ children, salir, ayuda, barra }: {
  children: ReactNode;
  salir: { to: string; confirm?: ConfirmText | null };
  ayuda?: PasoComoJugar[];
  barra?: ReactNode;
}) {
  const [altoBarra, setAltoBarra] = useState(96);
  return (
    <MultiShell maxWidth={480}>
      <EstilosImpostor />
      <BackButton to={salir.to} confirm={salir.confirm ?? null} />
      {ayuda && <BotonAyuda pasos={ayuda} />}
      {children}
      {barra && (
        <>
          <div aria-hidden="true" data-testid="imp-espacio-barra" style={{ height: `${altoBarra}px`, flexShrink: 0 }} />
          <BarraFija onAlto={setAltoBarra}>{barra}</BarraFija>
        </>
      )}
    </MultiShell>
  );
}

// "?": abre "Cómo jugar"
export function BotonAyuda({ pasos }: { pasos: PasoComoJugar[] }) {
  const [abierta, setAbierta] = useState(false);
  return alBody(
    <>
      <button type="button" className="imp-ayuda" aria-label="Cómo jugar" data-testid="imp-ayuda" onClick={() => setAbierta(true)}>
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
    <div ref={ref} className="imp-barra" data-testid="imp-barra">
      <EstilosImpostor />
      <div>{children}</div>
    </div>,
  );
}

// Hoja que sube desde abajo (se cierra tocando afuera, con Escape o con su botón). Al abrirse el foco va a la
// hoja misma (sin scrollear: así se lee desde el título) y el botón de cerrar queda siempre a la vista abajo.
export function Hoja({ titulo, onCerrar, children, cerrar = 'Cerrar' }: { titulo: string; onCerrar: () => void; children: ReactNode; cerrar?: string }) {
  const hoja = useRef<HTMLDivElement>(null);
  useEffect(() => hoja.current?.focus({ preventScroll: true }), []);
  return alBody(
    <div className="imp-velo" role="presentation" onClick={onCerrar} onKeyDown={(e) => e.key === 'Escape' && onCerrar()}>
      <EstilosImpostor />
      <div ref={hoja} tabIndex={-1} className="imp-hoja" role="dialog" aria-modal="true" aria-label={titulo} onClick={(e) => e.stopPropagation()}>
        <div className="imp-hoja-manija" />
        <h2 className="neon-title imp-titulo" style={{ fontSize: '26px' }}>{titulo}</h2>
        {children}
        <div className="imp-hoja-pie">
          <button type="button" className="imp-boton" onClick={onCerrar}>{cerrar}</button>
        </div>
      </div>
    </div>,
  );
}

const ICONOS = { users: Users, mask: VenetianMask, smartphone: Smartphone, megaphone: Megaphone, vote: Vote, trophy: Trophy };

// "Cómo jugar": pasos con ícono y título de color
export function ComoJugar({ pasos, onCerrar }: { pasos: PasoComoJugar[]; onCerrar: () => void }) {
  return (
    <Hoja titulo="Cómo jugar" onCerrar={onCerrar}>
      <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px', margin: 0, padding: 0 }} data-testid="imp-como-jugar">
        {pasos.map((p, i) => {
          const Icono = ICONOS[p.icono];
          return (
            <li key={p.titulo} className="imp-paso">
              <span className="imp-paso-icono" style={{ background: `${p.color}1f`, border: `1px solid ${p.color}66`, color: p.color, boxShadow: `0 0 12px ${p.color}33` }}>
                <Icono size={22} />
              </span>
              <div>
                <p className="kicker" style={{ fontSize: '11px' }}>Paso {i + 1}</p>
                <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: '19px', fontWeight: 700, color: p.color, textTransform: 'uppercase', lineHeight: 1.15, textShadow: `0 0 14px ${p.color}55` }}>
                  {p.titulo}
                </p>
                <p style={{ fontSize: '14px', lineHeight: 1.5, color: 'rgba(180,255,205,0.8)', marginTop: '2px' }}>{p.texto}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </Hoja>
  );
}

// Tres hinchas de clubes distintos (nuestros avatares recortados, sin círculo), el del medio adelante. Decorativo.
export function Hinchas({ chico = false }: { chico?: boolean }) {
  return (
    <div className={`imp-hinchas${chico ? ' chico' : ''}`} aria-hidden="true">
      {HINCHAS_PORTADA.map((id) => <img key={id} src={hinchaRecortado(id)} alt="" draggable={false} loading="eager" />)}
    </div>
  );
}
