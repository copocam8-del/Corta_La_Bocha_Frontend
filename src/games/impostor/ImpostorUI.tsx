import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { CircleHelp, Megaphone, Smartphone, Trophy, Users, VenetianMask, Vote, X } from 'lucide-react';
import { ConfirmDialog, CSS as CONFIRM_CSS } from '../../components/BackButton';
import type { ConfirmText } from '../../components/abandonar';
import { hinchaImagen } from '../../profile/avatars';
import { HINCHAS_PORTADA, IMPOSTOR_CSS, type PasoComoJugar } from './estilo';

// Piezas comunes de las pantallas de El Impostor (estilos en estilo.ts).

// Lo que es "fixed" va directo al <body>: si quedara adentro de un contenedor con animación
// (transform), se ubicaría respecto de ese contenedor y no de la pantalla
const alBody = (nodo: ReactNode) => (typeof document === 'undefined' ? nodo : createPortal(nodo, document.body));

export const EstilosImpostor = () => <style>{IMPOSTOR_CSS}</style>;

// Fondo oscuro liso (tapa el fondo de cancha de las salas en el modo online)
export const FondoImpostor = () => alBody(<div className="imp-fondo" aria-hidden="true" />);

// Pantalla completa: fondo oscuro, X arriba a la izquierda, ? a la derecha, una columna de 480 px y la
// barra con el botón principal fija abajo
export function PantallaImpostor({ children, salir, ayuda, barra }: {
  children: ReactNode;
  salir: { to: string; confirm?: ConfirmText | null };
  ayuda?: PasoComoJugar[];
  barra?: ReactNode;
}) {
  return (
    <>
      <EstilosImpostor />
      <FondoImpostor />
      <BotonSalir to={salir.to} confirm={salir.confirm ?? null} />
      {ayuda && <BotonAyuda pasos={ayuda} />}
      <main className="imp-col">{children}</main>
      {barra && <BarraFija>{barra}</BarraFija>}
    </>
  );
}

// Botón redondo "X": sale a "to"; si hay "confirm", pregunta antes (en plena partida)
export function BotonSalir({ to, confirm }: { to: string; confirm: ConfirmText | null }) {
  const navigate = useNavigate();
  const [preguntando, setPreguntando] = useState(false);
  return alBody(
    <>
      <style>{CONFIRM_CSS}</style>
      <button type="button" className="imp-redondo izq" aria-label="Salir" data-testid="imp-salir"
        onClick={() => (confirm ? setPreguntando(true) : navigate(to))}>
        <X size={22} />
      </button>
      {preguntando && confirm && <ConfirmDialog text={confirm} onConfirm={() => navigate(to)} onCancel={() => setPreguntando(false)} />}
    </>,
  );
}

// Botón redondo "?": abre "Cómo jugar"
export function BotonAyuda({ pasos }: { pasos: PasoComoJugar[] }) {
  const [abierta, setAbierta] = useState(false);
  return alBody(
    <>
      <button type="button" className="imp-redondo der" aria-label="Cómo jugar" data-testid="imp-ayuda" onClick={() => setAbierta(true)}>
        <CircleHelp size={22} />
      </button>
      {abierta && <ComoJugar pasos={pasos} onCerrar={() => setAbierta(false)} />}
    </>,
  );
}

export function BarraFija({ children }: { children: ReactNode }) {
  return alBody(
    <div className="imp-barra" data-testid="imp-barra">
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
        <h2 className="imp-titulo" style={{ fontSize: '26px' }}>{titulo}</h2>
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
              <span className="imp-paso-icono" style={{ background: `${p.color}22`, color: p.color }}><Icono size={24} /></span>
              <div>
                <p style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(200,255,220,0.55)', fontWeight: 600 }}>Paso {i + 1}</p>
                <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: '20px', fontWeight: 700, color: p.color, textTransform: 'uppercase', lineHeight: 1.15 }}>{p.titulo}</p>
                <p style={{ fontSize: '15px', lineHeight: 1.5, color: 'rgba(225,255,236,0.82)', marginTop: '2px' }}>{p.texto}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </Hoja>
  );
}

// Tres hinchas de clubes distintos (nuestros avatares), el del medio adelante. Decorativo.
export function Hinchas({ chico = false }: { chico?: boolean }) {
  return (
    <div className={`imp-hinchas${chico ? ' chico' : ''}`} aria-hidden="true">
      {HINCHAS_PORTADA.map((id) => <img key={id} src={hinchaImagen(id)} alt="" draggable={false} loading="eager" />)}
    </div>
  );
}
