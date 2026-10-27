// Estilo de las pantallas de El Impostor (en persona, online y su menú): app de celular limpia.
// Una columna de 480 px como máximo, fondo oscuro, bloques muy redondeados, letra grande y el botón
// principal verde fijo abajo. Los componentes que lo usan están en ImpostorUI.tsx.

export const VERDE = '#39ff8c';
export const ROJO = '#f87171'; // el impostor
export const CELESTE = '#5ecbff'; // los demás ("Hinchas")
export const AMARILLO = '#fbbf24';

// Tres hinchas de clubes distintos para las ilustraciones (nuestros avatares; el del medio va adelante)
export const HINCHAS_PORTADA = ['hincha_racing', 'hincha_boca_2', 'hincha_river'] as const;

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
  .imp-fondo { position: fixed; inset: 0; z-index: 0; background:
    radial-gradient(ellipse 80% 45% at 50% -5%, rgba(57,255,140,0.16) 0%, transparent 70%),
    linear-gradient(180deg, #04130b 0%, #020a06 100%); }
  .imp-col { position: relative; z-index: 1; width: 100%; max-width: 480px; margin: 0 auto; min-height: 100vh;
    padding: calc(76px + env(safe-area-inset-top, 0px)) 16px calc(124px + env(safe-area-inset-bottom, 0px));
    display: flex; flex-direction: column; gap: 18px; color: #eefff4; font-family: 'Inter', sans-serif; }
  .imp-col * { box-sizing: border-box; }
  .imp-entra { animation: impEntra 0.35s ease both; }
  @keyframes impEntra { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }

  /* Botones redondos de arriba: X (salir) y ? (cómo jugar) */
  .imp-redondo { position: fixed; z-index: 40; top: calc(14px + env(safe-area-inset-top, 0px)); width: 48px; height: 48px;
    border-radius: 50%; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.07); color: #eefff4;
    display: flex; align-items: center; justify-content: center; cursor: pointer; backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px); transition: background 0.2s ease; }
  .imp-redondo:hover { background: rgba(255,255,255,0.14); }
  .imp-redondo:focus-visible, .imp-boton:focus-visible, .imp-fila:focus-visible, .imp-chico:focus-visible { outline: 2px solid ${VERDE}; outline-offset: 2px; }
  .imp-redondo.izq { left: max(14px, calc(50% - 226px)); }
  .imp-redondo.der { right: max(14px, calc(50% - 226px)); }

  /* Textos */
  .imp-chiquito { font-size: 13px; letter-spacing: 2px; text-transform: uppercase; color: rgba(200,255,220,0.6); text-align: center; font-weight: 600; }
  .imp-titulo { font-family: 'Oswald', sans-serif; font-weight: 700; text-transform: uppercase; text-align: center; line-height: 1.05;
    font-size: clamp(30px, 9vw, 42px); overflow-wrap: anywhere; }
  .imp-gigante { font-family: 'Oswald', sans-serif; font-weight: 700; text-transform: uppercase; text-align: center; line-height: 1.02;
    font-size: clamp(38px, 12vw, 58px); overflow-wrap: anywhere; }
  .imp-texto { font-size: 16px; line-height: 1.5; color: rgba(225,255,236,0.8); text-align: center; }

  /* Bloques */
  .imp-bloque { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 22px; padding: 20px; }
  .imp-lista { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 22px; overflow: hidden; }
  .imp-fila { display: flex; align-items: center; gap: 14px; width: 100%; min-height: 64px; padding: 12px 16px; background: none; border: none;
    color: inherit; font: inherit; text-align: left; cursor: pointer; }
  .imp-fila + .imp-fila { border-top: 1px solid rgba(255,255,255,0.07); }
  div.imp-fila { cursor: default; }
  .imp-fila-icono { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .imp-fila-nombre { flex: 1; font-size: 17px; font-weight: 600; }
  .imp-fila-valor { font-size: 16px; color: rgba(200,255,220,0.7); display: flex; align-items: center; gap: 4px; }

  /* Botones */
  .imp-boton { width: 100%; min-height: 58px; border-radius: 18px; border: none; cursor: pointer; font-family: 'Oswald', sans-serif;
    font-weight: 700; font-size: 19px; letter-spacing: 1.5px; text-transform: uppercase; display: flex; align-items: center;
    justify-content: center; gap: 10px; background: ${VERDE}; color: #03200f; box-shadow: 0 10px 30px -8px rgba(57,255,140,0.55);
    transition: transform 0.15s ease, filter 0.15s ease; }
  .imp-boton:active:not(:disabled) { transform: scale(0.98); }
  .imp-boton:hover:not(:disabled) { filter: brightness(1.08); }
  .imp-boton:disabled { background: #18241d; color: rgba(255,255,255,0.35); box-shadow: none; cursor: not-allowed; }
  .imp-boton.secundario { background: #1b2a22; color: #eefff4; box-shadow: none; font-size: 16px; min-height: 52px; }
  .imp-chico { min-width: 44px; min-height: 44px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.12); background: rgba(255,255,255,0.07);
    color: #eefff4; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; font-size: 15px; gap: 6px; padding: 0 12px; }
  .imp-chico:disabled { opacity: 0.35; cursor: default; }
  .imp-chico.activo { border-color: ${VERDE}; background: rgba(57,255,140,0.14); color: ${VERDE}; }

  /* Barra fija de abajo con el botón principal */
  .imp-barra { position: fixed; z-index: 30; left: 0; right: 0; bottom: 0;
    padding: 16px 16px calc(16px + env(safe-area-inset-bottom, 0px));
    background: linear-gradient(180deg, rgba(2,10,6,0) 0%, rgba(2,10,6,0.92) 28%, #020a06 100%); }
  .imp-barra > div { max-width: 448px; margin: 0 auto; display: flex; flex-direction: column; gap: 10px; }
  .imp-barra-nota { text-align: center; font-size: 14px; color: rgba(200,255,220,0.65); }

  /* Interruptor */
  .imp-switch { width: 52px; height: 32px; border-radius: 999px; background: rgba(255,255,255,0.16); position: relative; transition: background 0.2s ease; flex-shrink: 0; }
  .imp-switch::after { content: ''; position: absolute; top: 3px; left: 3px; width: 26px; height: 26px; border-radius: 50%; background: #fff;
    transition: transform 0.2s ease; box-shadow: 0 2px 6px rgba(0,0,0,0.4); }
  .imp-switch.on { background: ${VERDE}; }
  .imp-switch.on::after { transform: translateX(20px); }

  /* Ilustración: tres hinchas, el del medio adelante */
  .imp-hinchas { display: flex; justify-content: center; align-items: flex-end; height: 150px; }
  .imp-hinchas img { width: 112px; height: 112px; border-radius: 50%; object-fit: cover; border: 3px solid #04130b; background: #26332c; }
  .imp-hinchas img:nth-child(1) { transform: translateX(22px) rotate(-6deg); }
  .imp-hinchas img:nth-child(3) { transform: translateX(-22px) rotate(6deg); }
  .imp-hinchas img:nth-child(2) { width: 140px; height: 140px; position: relative; z-index: 1; box-shadow: 0 12px 30px -10px rgba(0,0,0,0.8); }
  .imp-hinchas.chico { height: 104px; }
  .imp-hinchas.chico img { width: 78px; height: 78px; }
  .imp-hinchas.chico img:nth-child(2) { width: 98px; height: 98px; }

  /* Hoja que sube desde abajo (Cómo jugar, selectores) */
  .imp-velo { position: fixed; inset: 0; z-index: 60; background: rgba(0,0,0,0.6); display: flex; align-items: flex-end; justify-content: center;
    animation: impVelo 0.25s ease both; }
  .imp-hoja { width: 100%; max-width: 480px; max-height: 88vh; overflow-y: auto; background: #0a1a11; border-radius: 24px 24px 0 0;
    border: 1px solid rgba(255,255,255,0.08); padding: 10px 20px calc(20px + env(safe-area-inset-bottom, 0px)); color: #eefff4;
    font-family: 'Inter', sans-serif; animation: impHoja 0.32s cubic-bezier(.2,.9,.3,1) both; display: flex; flex-direction: column; gap: 16px; }
  .imp-hoja:focus { outline: none; }
  .imp-hoja-pie { position: sticky; bottom: calc(-20px - env(safe-area-inset-bottom, 0px)); margin: 0 -20px calc(-20px - env(safe-area-inset-bottom, 0px));
    padding: 12px 20px calc(20px + env(safe-area-inset-bottom, 0px)); background: linear-gradient(180deg, rgba(10,26,17,0) 0%, #0a1a11 30%); }
  .imp-hoja-manija { width: 44px; height: 5px; border-radius: 999px; background: rgba(255,255,255,0.2); margin: 0 auto 4px; }
  .imp-paso { display: flex; gap: 14px; align-items: flex-start; }
  .imp-paso-icono { width: 46px; height: 46px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .imp-opcion { display: flex; align-items: center; justify-content: space-between; width: 100%; min-height: 56px; padding: 0 16px; border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: inherit; font-size: 17px; cursor: pointer; }
  .imp-opcion.activo { border-color: ${VERDE}; background: rgba(57,255,140,0.12); color: ${VERDE}; font-weight: 600; }
  @keyframes impVelo { from { opacity: 0; } to { opacity: 1; } }
  @keyframes impHoja { from { transform: translateY(100%); } to { transform: none; } }

  /* Revelación */
  .imp-revela { animation: impRevela 0.8s cubic-bezier(.2,1.4,.4,1) both; }
  .imp-revela-2 { animation: impRevela 0.6s ease 0.6s both; }
  @keyframes impRevela { from { opacity: 0; transform: scale(0.6) rotateX(70deg); } to { opacity: 1; transform: none; } }

  @media (prefers-reduced-motion: reduce) {
    .imp-entra, .imp-revela, .imp-revela-2, .imp-velo, .imp-hoja { animation: none; }
    .imp-switch, .imp-switch::after, .imp-boton, .imp-tarjeta { transition: none; }
  }
`;
