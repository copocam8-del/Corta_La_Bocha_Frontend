import { useEffect, useState } from 'react';
import { orientacionDe, type OrientacionMemotest } from '../api/memotest';

// Orientación y ancho de la ventana para el tablero del memotest. Se actualiza si giran el celular
// o achican la ventana (resize + matchMedia de la orientación); los listeners se sacan al desmontar.
export interface PantallaMemotest {
  orientacion: OrientacionMemotest;
  ancho: number;
}

// Lo que se usa de la ventana (en los tests se pasa una falsa)
type Ventana = Pick<Window, 'innerWidth' | 'innerHeight' | 'addEventListener' | 'removeEventListener'> & {
  matchMedia?: (query: string) => Pick<MediaQueryList, 'addEventListener' | 'removeEventListener'>;
};

export function medirPantalla(win: Pick<Window, 'innerWidth' | 'innerHeight'> | undefined): PantallaMemotest {
  if (!win) return { orientacion: 'vertical', ancho: 0 };
  return { orientacion: orientacionDe(win.innerWidth, win.innerHeight), ancho: win.innerWidth };
}

// Avisa cada vez que cambia el tamaño o la orientación. Devuelve la función para dejar de escuchar.
export function escucharPantalla(win: Ventana, avisar: (p: PantallaMemotest) => void): () => void {
  const actualizar = () => avisar(medirPantalla(win));
  win.addEventListener('resize', actualizar);
  const mq = win.matchMedia?.('(orientation: portrait)');
  mq?.addEventListener('change', actualizar);
  return () => {
    win.removeEventListener('resize', actualizar);
    mq?.removeEventListener('change', actualizar);
  };
}

export function usePantallaMemotest(): PantallaMemotest {
  const [pantalla, setPantalla] = useState(() => medirPantalla(typeof window === 'undefined' ? undefined : window));
  useEffect(() => {
    const cambiar = (ahora: PantallaMemotest) =>
      setPantalla((antes) => (ahora.orientacion === antes.orientacion && ahora.ancho === antes.ancho ? antes : ahora));
    cambiar(medirPantalla(window));
    return escucharPantalla(window, cambiar);
  }, []);
  return pantalla;
}
