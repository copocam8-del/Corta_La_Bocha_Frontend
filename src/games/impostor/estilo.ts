// Estilo de las pantallas de El Impostor (en persona, online y su menú): el de Corta La Bocha. El fondo de
// cancha, los bloques de vidrio verde (.card), los títulos con brillo (.neon-title), los rótulos (.kicker) y el
// botón secundario (.ghost-btn) son los de la app (multi/MultiShell.tsx); el botón "Volver" es el de siempre.
// Acá queda sólo lo propio del Impostor. Los componentes que lo usan están en ImpostorUI.tsx.

export const VERDE = '#39ff8c';
export const ROJO = '#f87171'; // el impostor
export const CELESTE = '#5ecbff'; // los demás ("Hinchas")
export const AMARILLO = '#fbbf24';

// Tres hinchas de clubes distintos para las ilustraciones (nuestros avatares, recortados sin el fondo gris en
// public/avatars/impostor/; el del medio va adelante)
export const HINCHAS_PORTADA = ['hincha_racing', 'hincha_boca_2', 'hincha_river'] as const;
export const hinchaRecortado = (id: string) => `/avatars/impostor/${id}.webp`;

export interface PasoComoJugar {
  icono: 'users' | 'mask' | 'smartphone' | 'megaphone' | 'vote' | 'trophy';
  color: string;
  titulo: string;
  texto: string;
}

export const COMO_JUGAR_EN_PERSONA: PasoComoJugar[] = [
  { icono: 'users', color: VERDE, titulo: 'Armen la ronda', texto: 'Anoten los nombres (de 3 a 12) y elijan cuántos impostores hay, la temática y las rondas.' },
  { icono: 'smartphone', color: CELESTE, titulo: 'Pásense el celu', texto: 'Cada uno desliza la tarjeta hacia arriba y mira su palabra sin que nadie vea. Después la tapa y se lo pasa al siguiente.' },
  { icono: 'mask', color: ROJO, titulo: 'El impostor no sabe la palabra', texto: 'Los hinchas ven la palabra secreta; el impostor no (con la pista prendida, ve la categoría). ¡Que no se dé cuenta nadie!' },
  { icono: 'megaphone', color: AMARILLO, titulo: 'Pistas en voz alta', texto: 'Por turnos, dos vueltas: cada uno dice una pista corta sobre la palabra, sin decirla.' },
  { icono: 'vote', color: VERDE, titulo: 'Voten', texto: 'A la cuenta de tres, todos señalan a quien creen que es el impostor. Si lo descubren, puede intentar adivinar la palabra.' },
  { icono: 'trophy', color: CELESTE, titulo: 'Revelen', texto: 'Toquen "Revelar" para ver quién era el impostor y cuál era la palabra. ¡A la siguiente ronda!' },
];

export const COMO_JUGAR_ONLINE: PasoComoJugar[] = [
  { icono: 'mask', color: ROJO, titulo: 'Uno es el impostor', texto: 'Todos reciben la misma palabra secreta menos uno: el impostor, que sólo ve la categoría.' },
  { icono: 'megaphone', color: AMARILLO, titulo: 'Pistas por turnos', texto: 'Cuando te toca, escribí una pista corta (hasta 30 letras). Son dos vueltas. ¡Sin decir la palabra!' },
  { icono: 'vote', color: VERDE, titulo: 'Votación', texto: 'Todos votan a quién creen que es el impostor. Si hay empate, el impostor zafa.' },
  { icono: 'trophy', color: CELESTE, titulo: 'Adivinanza', texto: 'Si descubren al impostor, tiene 20 segundos para adivinar la palabra y ganar igual.' },
];

export const IMPOSTOR_CSS = `
  /* Tamaños de título (el estilo es .neon-title de la app) */
  .imp-titulo { font-size: clamp(28px, 8vw, 36px); text-align: center; line-height: 1.08; overflow-wrap: anywhere; text-wrap: balance; }
  .imp-gigante { font-family: 'Oswald', sans-serif; font-weight: 700; text-transform: uppercase; text-align: center; line-height: 1.02;
    font-size: clamp(38px, 12vw, 56px); color: #eafff2; overflow-wrap: anywhere; text-shadow: 0 0 18px rgba(57,255,140,0.45); }
  .imp-texto { font-size: 15px; line-height: 1.5; color: rgba(180,255,205,0.75); text-align: center; }
  .imp-centro { text-align: center; }
  /* Colores de rol, con el mismo brillo suave que el resto de la app */
  .imp-rojo { color: ${ROJO}; text-shadow: 0 0 18px rgba(248,113,113,0.55); }
  .imp-celeste { color: ${CELESTE}; text-shadow: 0 0 18px rgba(94,203,255,0.5); }

  /* "?" de Cómo jugar: arriba a la derecha, igual que el botón Volver (que va a la izquierda) */
  .imp-ayuda { position: fixed; z-index: 50; top: calc(12px + env(safe-area-inset-top, 0px)); right: calc(12px + env(safe-area-inset-right, 0px));
    width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer;
    background: rgba(4,20,11,0.72); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(57,255,140,0.3);
    color: #7CFFB2; box-shadow: 0 6px 20px -8px rgba(0,0,0,0.7); transition: all 0.2s ease; }

  /* Tarjetas del menú (son .card de la app): se iluminan al pasar */
  .imp-modo { transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s; }
  .imp-modo:focus-visible { border-color: #39ff8c; box-shadow: 0 0 24px rgba(57,255,140,0.35), 0 30px 60px -20px rgba(0,0,0,0.75); outline: none; }
  .imp-modo:active { transform: scale(0.99); }

  /* Filas de ajustes: como los campos del login, con el ícono en un circulito verde */
  .imp-filas { display: flex; flex-direction: column; gap: 10px; list-style: none; }
  .imp-fila { display: flex; align-items: center; gap: 12px; width: 100%; min-height: 58px; padding: 9px 14px; border-radius: 10px;
    background: rgba(10,30,18,0.5); border: 1px solid rgba(57,255,140,0.22); color: #ecfff3; font: inherit; text-align: left;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s; }
  button.imp-fila { cursor: pointer; }
  button.imp-fila:focus-visible { border-color: #39ff8c; background: rgba(57,255,140,0.08);
    box-shadow: 0 0 0 3px rgba(57,255,140,0.18), 0 0 18px rgba(57,255,140,0.3); outline: none; }
  .imp-fila-icono { width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
    background: rgba(57,255,140,0.12); border: 1px solid rgba(57,255,140,0.4); color: ${VERDE}; box-shadow: 0 0 12px rgba(57,255,140,0.2);
    font-family: 'Oswald', sans-serif; font-weight: 700; font-size: 17px; }
  .imp-fila-nombre { flex: 1; min-width: 0; font-size: 16px; font-weight: 600; overflow-wrap: anywhere; }
  .imp-fila-sub { display: block; font-size: 13px; font-weight: 400; color: rgba(180,255,205,0.6); }
  .imp-fila-valor { font-size: 15px; color: #7CFFB2; display: flex; align-items: center; gap: 2px; }

  /* Campo de texto: el .field del login */
  .imp-campo { width: 100%; min-width: 0; min-height: 50px; background: rgba(10,30,18,0.5); border: 1px solid rgba(57,255,140,0.22); color: #ecfff3;
    padding: 0 16px; border-radius: 10px; font-size: 16px; font-family: 'Inter', sans-serif; outline: none;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s; }
  .imp-campo::placeholder { color: rgba(190,255,210,0.4); }
  .imp-campo:focus { border-color: #39ff8c; background: rgba(57,255,140,0.08); box-shadow: 0 0 0 3px rgba(57,255,140,0.18), 0 0 18px rgba(57,255,140,0.3); }

  /* Botón principal: el "Entrar" del login (degradé verde brillante). Desactivado: el mismo verde, apagado */
  .imp-boton { width: 100%; min-height: 54px; display: flex; align-items: center; justify-content: center; gap: 8px; border: none; border-radius: 10px;
    background: linear-gradient(135deg, #0fae5d, #39ff8c); color: #04210f; font-family: 'Inter', sans-serif; font-weight: 600; font-size: 16px;
    letter-spacing: 0.3px; cursor: pointer; box-shadow: 0 0 20px rgba(57,255,140,0.45), 0 10px 24px -8px rgba(15,174,93,0.5);
    transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease; }
  .imp-boton:active:not(:disabled) { transform: scale(0.98); }
  .imp-boton:disabled { opacity: 0.45; cursor: not-allowed; box-shadow: none; }
  .imp-boton:focus-visible, .imp-chico:focus-visible, .imp-ayuda:focus-visible, .imp-opcion:focus-visible { outline: 2px solid ${VERDE}; outline-offset: 2px; }

  /* Botones chicos (− / +, reloj, tapar, sacar): verde neón */
  .imp-chico { min-width: 44px; min-height: 44px; padding: 0 12px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center;
    gap: 6px; border: 1px solid rgba(57,255,140,0.45); background: rgba(57,255,140,0.08); color: ${VERDE}; font-size: 15px; cursor: pointer;
    transition: all 0.18s ease; }
  .imp-chico:disabled { opacity: 0.3; cursor: default; }
  .imp-chico.activo { border-color: ${VERDE}; background: rgba(57,255,140,0.2); color: #eafff2; box-shadow: 0 0 14px rgba(57,255,140,0.4); }

  /* Interruptor verde neón */
  .imp-switch { width: 52px; height: 30px; border-radius: 999px; position: relative; flex-shrink: 0; transition: all 0.2s ease;
    background: rgba(57,255,140,0.08); border: 1px solid rgba(57,255,140,0.4); }
  .imp-switch::after { content: ''; position: absolute; top: 3px; left: 3px; width: 22px; height: 22px; border-radius: 50%;
    background: rgba(160,255,195,0.55); transition: transform 0.2s ease, background 0.2s ease; }
  .imp-switch.on { background: ${VERDE}; border-color: ${VERDE}; box-shadow: 0 0 14px rgba(57,255,140,0.6); }
  .imp-switch.on::after { transform: translateX(22px); background: #04210f; }

  /* Barra fija de abajo con el botón principal (y el aviso justo arriba del botón) */
  .imp-barra { position: fixed; z-index: 30; left: 0; right: 0; bottom: 0;
    padding: 18px max(16px, env(safe-area-inset-right, 0px)) calc(16px + env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left, 0px));
    background: linear-gradient(180deg, rgba(1,8,5,0) 0%, rgba(1,8,5,0.88) 26%, rgba(1,8,5,0.96) 100%); }
  .imp-barra > div { max-width: 480px; margin: 0 auto; display: flex; flex-direction: column; gap: 10px; }
  .imp-barra-nota { text-align: center; font-size: 13px; color: #bbf7d0; }

  /* Ilustración: tres hinchas recortados (sin círculo), el del medio adelante, con brillo verde */
  .imp-hinchas { display: flex; justify-content: center; align-items: flex-end; height: 150px; filter: drop-shadow(0 0 14px rgba(57,255,140,0.35)); }
  .imp-hinchas img { height: 128px; width: auto; }
  .imp-hinchas img:nth-child(1) { transform: translateX(24px); }
  .imp-hinchas img:nth-child(3) { transform: translateX(-24px); }
  .imp-hinchas img:nth-child(2) { height: 150px; position: relative; z-index: 1; }
  .imp-hinchas.chico { height: 104px; }
  .imp-hinchas.chico img { height: 88px; }
  .imp-hinchas.chico img:nth-child(2) { height: 104px; }

  /* Hoja que sube desde abajo (Cómo jugar, selectores): el mismo vidrio verde de las tarjetas */
  .imp-velo { position: fixed; inset: 0; z-index: 60; background: rgba(0,4,2,0.72); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
    display: flex; align-items: flex-end; justify-content: center; animation: impVelo 0.25s ease both; }
  .imp-hoja { width: 100%; max-width: 480px; max-height: 88vh; overflow-y: auto; color: #eafff2; font-family: 'Inter', sans-serif;
    background: rgba(4,20,11,0.94); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
    border: 1px solid rgba(57,255,140,0.3); border-top: 2px solid rgba(57,255,140,0.7); border-bottom: none; border-radius: 18px 18px 0 0;
    box-shadow: 0 -10px 40px -10px rgba(57,255,140,0.25); padding: 10px 20px calc(20px + env(safe-area-inset-bottom, 0px));
    display: flex; flex-direction: column; gap: 16px; animation: impHoja 0.32s cubic-bezier(.2,.9,.3,1) both; }
  .imp-hoja:focus { outline: none; }
  .imp-hoja-manija { width: 44px; height: 4px; border-radius: 999px; background: rgba(57,255,140,0.45); margin: 0 auto 2px; }
  .imp-hoja-pie { position: sticky; bottom: calc(-20px - env(safe-area-inset-bottom, 0px)); margin: 0 -20px calc(-20px - env(safe-area-inset-bottom, 0px));
    padding: 12px 20px calc(20px + env(safe-area-inset-bottom, 0px)); background: linear-gradient(180deg, rgba(4,20,11,0) 0%, rgba(4,20,11,0.96) 30%); }
  .imp-paso { display: flex; gap: 14px; align-items: flex-start; }
  .imp-paso-icono { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .imp-opcion { display: flex; align-items: center; width: 100%; min-height: 54px; padding: 0 16px; border-radius: 10px; cursor: pointer;
    background: rgba(10,30,18,0.5); border: 1px solid rgba(57,255,140,0.22); color: #ecfff3; font-size: 16px; font-family: 'Inter', sans-serif;
    transition: all 0.2s ease; }
  .imp-opcion.activo { border-color: ${VERDE}; background: rgba(57,255,140,0.12); color: ${VERDE}; font-weight: 600; box-shadow: 0 0 14px rgba(57,255,140,0.25); }
  @keyframes impVelo { from { opacity: 0; } to { opacity: 1; } }
  @keyframes impHoja { from { transform: translateY(100%); } to { transform: none; } }

  /* Revelación */
  .imp-revela { animation: impRevela 0.8s cubic-bezier(.2,1.4,.4,1) both; }
  .imp-revela-2 { animation: impRevela 0.6s ease 0.6s both; }
  @keyframes impRevela { from { opacity: 0; transform: scale(0.6) rotateX(70deg); } to { opacity: 1; transform: none; } }

  /* Efectos al pasar el mouse, sólo con mouse: en el celular el :hover queda "pegado" donde se tocó */
  @media (hover: hover) {
    .imp-ayuda:hover { border-color: #39ff8c; background: rgba(57,255,140,0.1); box-shadow: 0 0 14px rgba(57,255,140,0.25); color: #eafff2; }
    .imp-modo:hover { border-color: #39ff8c; box-shadow: 0 0 24px rgba(57,255,140,0.35), 0 30px 60px -20px rgba(0,0,0,0.75); }
    button.imp-fila:hover { border-color: #39ff8c; background: rgba(57,255,140,0.08); box-shadow: 0 0 0 3px rgba(57,255,140,0.18), 0 0 18px rgba(57,255,140,0.3); }
    .imp-boton:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.1); box-shadow: 0 0 32px rgba(57,255,140,0.7), 0 14px 28px -8px rgba(15,174,93,0.6); }
    .imp-chico:hover:not(:disabled) { border-color: ${VERDE}; background: rgba(57,255,140,0.14); box-shadow: 0 0 14px rgba(57,255,140,0.35); }
    .imp-opcion:hover { border-color: rgba(57,255,140,0.6); }
    .imp-voto:hover:not(:disabled) { border-color: #39ff8c; background: rgba(57,255,140,0.08); box-shadow: 0 0 18px rgba(57,255,140,0.3); }
  }

  @media (prefers-reduced-motion: reduce) {
    .imp-revela, .imp-revela-2, .imp-velo, .imp-hoja { animation: none; }
    .imp-switch, .imp-switch::after, .imp-boton, .imp-chico, .imp-tarjeta, .imp-modo { transition: none; }
  }
`;
