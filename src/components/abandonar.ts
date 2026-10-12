// Textos de la ventana "¿Seguro?" del botón Volver (components/BackButton.tsx)

export interface ConfirmText {
  title: string;
  message: string;
  confirmLabel?: string;
}

// En medio de una partida: salir cuenta como perdida
export const ABANDONAR: ConfirmText = {
  title: '¿Seguro que querés abandonar?',
  message: 'La partida cuenta como perdida.',
  confirmLabel: 'Abandonar',
};
