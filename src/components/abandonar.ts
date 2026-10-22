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

// El Impostor en persona: no cuenta para estadísticas, pero se pierde la partida en curso
export const SALIR_EN_PERSONA: ConfirmText = {
  title: '¿Salir de la partida?',
  message: 'Se pierde la partida en curso (no cuenta para las estadísticas).',
  confirmLabel: 'Salir',
};
