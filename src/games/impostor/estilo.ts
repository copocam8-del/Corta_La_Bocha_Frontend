import { Megaphone, Smartphone, Trophy, Users, VenetianMask, Vote } from 'lucide-react';
import { AMARILLO, VERDE, type PasoComoJugar } from '../ui/estilo';

// Estilo propio de El Impostor (en persona, online y su menú). Lo común a todos los juegos (cancha, vidrio, filas de
// ajustes, botón fijo abajo, "?" y hoja "Cómo jugar") está en games/ui/estilo.ts; acá quedan los colores de rol, la
// ilustración de los hinchas y la animación de la revelación. Los componentes que lo usan están en ImpostorUI.tsx.

export { AMARILLO, VERDE };
export const ROJO = '#f87171'; // el impostor
export const CELESTE = '#5ecbff'; // los demás ("Hinchas")

// Tres hinchas de clubes distintos para las ilustraciones (nuestros avatares, recortados sin el fondo gris en
// public/avatars/impostor/; el del medio va adelante)
export const HINCHAS_PORTADA = ['hincha_racing', 'hincha_boca_2', 'hincha_river'] as const;
export const hinchaRecortado = (id: string) => `/avatars/impostor/${id}.webp`;

export const COMO_JUGAR_EN_PERSONA: PasoComoJugar[] = [
  { icono: Users, color: VERDE, titulo: 'Armen la ronda', texto: 'Anoten los nombres (de 3 a 12) y elijan cuántos impostores hay, la temática y las rondas.' },
  { icono: Smartphone, color: CELESTE, titulo: 'Pásense el celu', texto: 'Cada uno desliza la tarjeta hacia arriba y mira su palabra sin que nadie vea. Después la tapa y se lo pasa al siguiente.' },
  { icono: VenetianMask, color: ROJO, titulo: 'El impostor no sabe la palabra', texto: 'Los hinchas ven la palabra secreta; el impostor no (con la pista prendida, ve la categoría). ¡Que no se dé cuenta nadie!' },
  { icono: Megaphone, color: AMARILLO, titulo: 'Pistas en voz alta', texto: 'Por turnos, dos vueltas: cada uno dice una pista corta sobre la palabra, sin decirla.' },
  { icono: Vote, color: VERDE, titulo: 'Voten', texto: 'A la cuenta de tres, todos señalan a quien creen que es el impostor. Si lo descubren, puede intentar adivinar la palabra.' },
  { icono: Trophy, color: CELESTE, titulo: 'Revelen', texto: 'Toquen "Revelar" para ver quién era el impostor y cuál era la palabra. ¡A la siguiente ronda!' },
];

export const COMO_JUGAR_ONLINE: PasoComoJugar[] = [
  { icono: VenetianMask, color: ROJO, titulo: 'Uno es el impostor', texto: 'Todos reciben la misma palabra secreta menos uno: el impostor, que sólo ve la categoría.' },
  { icono: Megaphone, color: AMARILLO, titulo: 'Pistas por turnos', texto: 'Cuando te toca, escribí una pista corta (hasta 30 letras). Son dos vueltas. ¡Sin decir la palabra!' },
  { icono: Vote, color: VERDE, titulo: 'Votación', texto: 'Todos votan a quién creen que es el impostor. Si hay empate, el impostor zafa.' },
  { icono: Trophy, color: CELESTE, titulo: 'Adivinanza', texto: 'Si descubren al impostor, tiene 20 segundos para adivinar la palabra y ganar igual.' },
];

export const IMPOSTOR_CSS = `
  /* Colores de rol, con el mismo brillo suave que el resto de la app */
  .imp-rojo { color: ${ROJO}; text-shadow: 0 0 18px rgba(248,113,113,0.55); }
  .imp-celeste { color: ${CELESTE}; text-shadow: 0 0 18px rgba(94,203,255,0.5); }

  /* Ilustración: tres hinchas recortados (sin círculo), el del medio adelante, con brillo verde */
  .imp-hinchas { display: flex; justify-content: center; align-items: flex-end; height: 150px; filter: drop-shadow(0 0 14px rgba(57,255,140,0.35)); }
  .imp-hinchas img { height: 128px; width: auto; }
  .imp-hinchas img:nth-child(1) { transform: translateX(24px); }
  .imp-hinchas img:nth-child(3) { transform: translateX(-24px); }
  .imp-hinchas img:nth-child(2) { height: 150px; position: relative; z-index: 1; }
  .imp-hinchas.chico { height: 104px; }
  .imp-hinchas.chico img { height: 88px; }
  .imp-hinchas.chico img:nth-child(2) { height: 104px; }

  /* Revelación */
  .imp-revela { animation: impRevela 0.8s cubic-bezier(.2,1.4,.4,1) both; }
  .imp-revela-2 { animation: impRevela 0.6s ease 0.6s both; }
  @keyframes impRevela { from { opacity: 0; transform: scale(0.6) rotateX(70deg); } to { opacity: 1; transform: none; } }

  @media (hover: hover) {
    .imp-voto:hover:not(:disabled) { border-color: #39ff8c; background: rgba(57,255,140,0.08); box-shadow: 0 0 18px rgba(57,255,140,0.3); }
  }

  @media (prefers-reduced-motion: reduce) {
    .imp-revela, .imp-revela-2 { animation: none; }
    .imp-tarjeta { transition: none; }
  }
`;
