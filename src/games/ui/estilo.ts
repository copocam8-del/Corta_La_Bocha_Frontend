import type { LucideIcon } from 'lucide-react';

// Estilo común de las pantallas de los juegos (menú, configuración, partida solo, salas y partidas multijugador). Es
// el de El Impostor, que a su vez es el de Corta La Bocha: el fondo de cancha, los bloques de vidrio verde (.card),
// los títulos con brillo (.neon-title), los rótulos (.kicker) y el botón secundario (.ghost-btn) son los de la app
// (multi/MultiShell.tsx); el botón "Volver" es el de siempre. Acá van las piezas del formato: columna de 480 px,
// filas de ajustes, botón principal fijo abajo, "?" con la hoja "Cómo jugar". Los componentes están en JuegoUI.tsx.
// Lo que es sólo del Impostor (colores de rol, hinchas) está en games/impostor/estilo.ts.

export const VERDE = '#39ff8c';
export const AMARILLO = '#fbbf24';
export const AZUL = '#60a5fa';
export const NARANJA = '#fdba74';

export interface PasoComoJugar {
  icono: LucideIcon;
  color: string;
  titulo: string;
  texto: string;
}

export const JUEGO_CSS = `
  /* Tamaños de título (el estilo es .neon-title de la app) */
  .ui-titulo { font-size: clamp(28px, 8vw, 36px); text-align: center; line-height: 1.08; overflow-wrap: anywhere; text-wrap: balance; }
  .ui-gigante { font-family: 'Oswald', sans-serif; font-weight: 700; text-transform: uppercase; text-align: center; line-height: 1.02;
    font-size: clamp(38px, 12vw, 56px); color: #eafff2; overflow-wrap: anywhere; text-shadow: 0 0 18px rgba(57,255,140,0.45); }
  .ui-texto { font-size: 15px; line-height: 1.5; color: rgba(180,255,205,0.75); text-align: center; }
  .ui-centro { text-align: center; }

  /* Ícono del juego arriba del título (el de gameIcons.ts), en un círculo verde con brillo */
  .ui-icono-juego { width: 76px; height: 76px; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center;
    background: rgba(57,255,140,0.12); border: 1px solid rgba(57,255,140,0.45); color: ${VERDE};
    box-shadow: 0 0 24px rgba(57,255,140,0.35), inset 0 0 18px rgba(57,255,140,0.12); }

  /* "?" de Cómo jugar: arriba a la derecha, igual que el botón Volver (que va a la izquierda) */
  .ui-ayuda { position: fixed; z-index: 50; top: calc(12px + env(safe-area-inset-top, 0px)); right: calc(12px + env(safe-area-inset-right, 0px));
    width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer;
    background: rgba(4,20,11,0.72); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(57,255,140,0.3);
    color: #7CFFB2; box-shadow: 0 6px 20px -8px rgba(0,0,0,0.7); transition: all 0.2s ease; }

  /* Tarjetas grandes de elegir (son .card de la app): se iluminan al pasar */
  .ui-modo { transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s; }
  .ui-modo:focus-visible { border-color: #39ff8c; box-shadow: 0 0 24px rgba(57,255,140,0.35), 0 30px 60px -20px rgba(0,0,0,0.75); outline: none; }
  .ui-modo:active { transform: scale(0.99); }

  /* Filas de ajustes: como los campos del login, con el ícono en un circulito verde */
  .ui-filas { display: flex; flex-direction: column; gap: 10px; list-style: none; }
  .ui-fila { display: flex; align-items: center; gap: 12px; width: 100%; min-height: 58px; padding: 9px 14px; border-radius: 10px;
    background: rgba(10,30,18,0.5); border: 1px solid rgba(57,255,140,0.22); color: #ecfff3; font: inherit; text-align: left;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s; }
  button.ui-fila { cursor: pointer; }
  button.ui-fila:focus-visible { border-color: #39ff8c; background: rgba(57,255,140,0.08);
    box-shadow: 0 0 0 3px rgba(57,255,140,0.18), 0 0 18px rgba(57,255,140,0.3); outline: none; }
  .ui-fila-icono { width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
    background: rgba(57,255,140,0.12); border: 1px solid rgba(57,255,140,0.4); color: ${VERDE}; box-shadow: 0 0 12px rgba(57,255,140,0.2);
    font-family: 'Oswald', sans-serif; font-weight: 700; font-size: 17px; }
  .ui-fila-nombre { flex: 1; min-width: 0; font-size: 16px; font-weight: 600; overflow-wrap: anywhere; }
  .ui-fila-sub { display: block; font-size: 13px; font-weight: 400; color: rgba(180,255,205,0.6); }
  .ui-fila-valor { font-size: 15px; color: #7CFFB2; display: flex; align-items: center; gap: 2px; }

  /* Campo de texto: el .field del login */
  .ui-campo { width: 100%; min-width: 0; min-height: 50px; background: rgba(10,30,18,0.5); border: 1px solid rgba(57,255,140,0.22); color: #ecfff3;
    padding: 0 16px; border-radius: 10px; font-size: 16px; font-family: 'Inter', sans-serif; outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s; }
  .ui-campo::placeholder { color: rgba(190,255,210,0.4); }
  .ui-campo:focus { border-color: #39ff8c; background: rgba(57,255,140,0.08); box-shadow: 0 0 0 3px rgba(57,255,140,0.18), 0 0 18px rgba(57,255,140,0.3); }

  /* Botón principal: el "Entrar" del login (degradé verde brillante). Desactivado: el mismo verde, apagado */
  .ui-boton { width: 100%; min-height: 54px; display: flex; align-items: center; justify-content: center; gap: 8px; border: none; border-radius: 10px;
    background: linear-gradient(135deg, #0fae5d, #39ff8c); color: #04210f; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 16px;
    letter-spacing: 0.3px; cursor: pointer; box-shadow: 0 0 20px rgba(57,255,140,0.45), 0 10px 24px -8px rgba(15,174,93,0.5);
    transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease; }
  .ui-boton:active:not(:disabled) { transform: scale(0.98); }
  .ui-boton:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }
  .ui-boton:focus-visible, .ui-chico:focus-visible, .ui-ayuda:focus-visible, .ui-opcion:focus-visible { outline: 2px solid ${VERDE}; outline-offset: 2px; }

  /* Botones chicos (− / +, reloj, tapar, sacar): verde neón */
  .ui-chico { min-width: 44px; min-height: 44px; padding: 0 12px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center;
    gap: 6px; border: 1px solid rgba(57,255,140,0.45); background: rgba(57,255,140,0.08); color: ${VERDE}; font-size: 15px; cursor: pointer;
    transition: all 0.18s ease; }
  .ui-chico:disabled { opacity: 0.3; cursor: default; }
  .ui-chico.activo { border-color: ${VERDE}; background: rgba(57,255,140,0.2); color: #eafff2; box-shadow: 0 0 14px rgba(57,255,140,0.4); }

  /* Interruptor verde neón */
  .ui-switch { width: 52px; height: 30px; border-radius: 999px; position: relative; flex-shrink: 0; transition: all 0.2s ease;
    background: rgba(57,255,140,0.08); border: 1px solid rgba(57,255,140,0.4); }
  .ui-switch::after { content: ''; position: absolute; top: 3px; left: 3px; width: 22px; height: 22px; border-radius: 50%;
    background: rgba(160,255,195,0.55); transition: transform 0.2s ease, background 0.2s ease; }
  .ui-switch.on { background: ${VERDE}; border-color: ${VERDE}; box-shadow: 0 0 14px rgba(57,255,140,0.6); }
  .ui-switch.on::after { transform: translateX(22px); background: #04210f; }

  /* Barra fija de abajo con el botón principal (y el aviso justo arriba del botón) */
  .ui-barra { position: fixed; z-index: 30; left: 0; right: 0; bottom: 0;
    padding: 18px max(16px, env(safe-area-inset-right, 0px)) calc(16px + env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left, 0px));
    background: linear-gradient(180deg, rgba(1,8,5,0) 0%, rgba(1,8,5,0.88) 26%, rgba(1,8,5,0.96) 100%); }
  .ui-barra > div { max-width: 480px; margin: 0 auto; display: flex; flex-direction: column; gap: 10px; }
  .ui-barra-nota { text-align: center; font-size: 13px; color: #bbf7d0; }

  /* Tableros que pueden ser más anchos que la columna en la compu (sopa, memotest, grilla de Tutti Frutti): miden
     --ancho como máximo y se centran sobre la columna. En el celular miden lo mismo que la columna (nunca hay scroll
     horizontal) */
  .ui-ancho { --w: min(var(--ancho, 480px), calc(100vw - 40px)); width: var(--w); max-width: none; margin-left: calc((100% - var(--w)) / 2); }

  /* Hoja que sube desde abajo (Cómo jugar, selectores): el mismo vidrio verde de las tarjetas */
  .ui-velo { position: fixed; inset: 0; z-index: 60; background: rgba(0,4,2,0.72); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
    display: flex; align-items: flex-end; justify-content: center; animation: uiVelo 0.25s ease both; }
  .ui-hoja { width: 100%; max-width: 480px; max-height: 88vh; overflow-y: auto; color: #eafff2; font-family: 'Inter', sans-serif;
    background: rgba(4,20,11,0.94); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
    border: 1px solid rgba(57,255,140,0.3); border-top: 2px solid rgba(57,255,140,0.7); border-bottom: none; border-radius: 18px 18px 0 0;
    box-shadow: 0 -10px 40px -10px rgba(57,255,140,0.25); padding: 10px 20px calc(20px + env(safe-area-inset-bottom, 0px));
    display: flex; flex-direction: column; gap: 16px; animation: uiHoja 0.32s cubic-bezier(.2,.9,.3,1) both; }
  .ui-hoja:focus { outline: none; }
  .ui-hoja-manija { width: 44px; height: 4px; border-radius: 999px; background: rgba(57,255,140,0.45); margin: 0 auto 2px; }
  .ui-hoja-pie { position: sticky; bottom: calc(-20px - env(safe-area-inset-bottom, 0px)); margin: 0 -20px calc(-20px - env(safe-area-inset-bottom, 0px));
    padding: 12px 20px calc(20px + env(safe-area-inset-bottom, 0px)); background: linear-gradient(180deg, rgba(4,20,11,0) 0%, rgba(4,20,11,0.96) 30%); }
  .ui-paso { display: flex; gap: 14px; align-items: flex-start; }
  .ui-paso-icono { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .ui-opcion { display: flex; align-items: center; width: 100%; min-height: 54px; padding: 0 16px; border-radius: 10px; cursor: pointer;
    background: rgba(10,30,18,0.5); border: 1px solid rgba(57,255,140,0.22); color: #ecfff3; font-size: 16px; font-family: 'Inter', sans-serif;
    text-align: left; transition: all 0.2s ease; }
  .ui-opcion.activo { border-color: ${VERDE}; background: rgba(57,255,140,0.12); color: ${VERDE}; font-weight: 600; box-shadow: 0 0 14px rgba(57,255,140,0.25); }
  .ui-opcion .ui-fila-sub { padding-bottom: 2px; }
  .ui-opcion:has(.ui-fila-sub) { padding: 8px 16px; }
  @keyframes uiVelo { from { opacity: 0; } to { opacity: 1; } }
  @keyframes uiHoja { from { transform: translateY(100%); } to { transform: none; } }

  /* Efectos al pasar el mouse, sólo con mouse: en el celular el :hover queda "pegado" donde se tocó */
  @media (hover: hover) {
    .ui-ayuda:hover { border-color: #39ff8c; background: rgba(57,255,140,0.1); box-shadow: 0 0 14px rgba(57,255,140,0.25); color: #eafff2; }
    .ui-modo:hover { border-color: #39ff8c; box-shadow: 0 0 24px rgba(57,255,140,0.35), 0 30px 60px -20px rgba(0,0,0,0.75); }
    button.ui-fila:hover { border-color: #39ff8c; background: rgba(57,255,140,0.08); box-shadow: 0 0 0 3px rgba(57,255,140,0.18), 0 0 18px rgba(57,255,140,0.3); }
    .ui-boton:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.1); box-shadow: 0 0 32px rgba(57,255,140,0.7), 0 14px 28px -8px rgba(15,174,93,0.6); }
    .ui-chico:hover:not(:disabled) { border-color: ${VERDE}; background: rgba(57,255,140,0.14); box-shadow: 0 0 14px rgba(57,255,140,0.35); }
    .ui-opcion:hover { border-color: rgba(57,255,140,0.6); }
  }

  @media (prefers-reduced-motion: reduce) {
    .ui-velo, .ui-hoja { animation: none; }
    .ui-switch, .ui-switch::after, .ui-boton, .ui-chico, .ui-modo { transition: none; }
  }
`;
