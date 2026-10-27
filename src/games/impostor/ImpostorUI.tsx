import type { ReactNode } from 'react';
import type { PasoComoJugar } from '../ui/estilo';
import { EstilosJuego, PantallaJuego, type Salir } from '../ui/JuegoUI';
import { hinchaRecortado, HINCHAS_PORTADA, IMPOSTOR_CSS } from './estilo';

// Piezas propias de las pantallas de El Impostor. Lo común a todos los juegos (pantalla, barra fija, "?", hojas y
// filas de ajustes) está en games/ui/JuegoUI.tsx.

// Los estilos comunes y los del Impostor (colores de rol, hinchas, revelación)
export const EstilosImpostor = () => (
  <>
    <EstilosJuego />
    <style>{IMPOSTOR_CSS}</style>
  </>
);

// La pantalla común de los juegos, con los estilos del Impostor
export function PantallaImpostor({ children, ...resto }: { children: ReactNode; salir: Salir; ayuda?: PasoComoJugar[]; barra?: ReactNode }) {
  return (
    <PantallaJuego {...resto}>
      <EstilosImpostor />
      {children}
    </PantallaJuego>
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
