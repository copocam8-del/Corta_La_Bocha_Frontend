import {
  Bot, CalendarCheck, CircleDot, Flame, Grid3x3, HelpCircle, Keyboard, Layers, Lightbulb, MousePointerClick, PenLine, Send,
  Share2, Shuffle, StopCircle, Timer, Trophy, Users, Zap,
} from 'lucide-react';
import { AMARILLO, AZUL, NARANJA, VERDE, type PasoComoJugar } from './ui/estilo';
import { COMO_JUGAR_ONLINE } from './impostor/estilo';

// "Cómo jugar" de cada juego (la hoja que abre el "?"). Son las reglas de verdad: las decide el backend (ver su
// CLAUDE.md y src/rooms/modes/*.mode.ts). Si cambia una regla allá, cambiá el texto acá.

const ROJO = '#f87171';

export const COMO_JUGAR: Record<string, PasoComoJugar[]> = {
  tutti_frutti: [
    { icono: Shuffle, color: VERDE, titulo: 'Sale una letra', texto: 'Se sortea una letra y aparecen las categorías de la ronda (jugadores, equipos, estadios…).' },
    { icono: PenLine, color: AZUL, titulo: 'Completá todo', texto: 'En cada categoría escribí un nombre que empiece con esa letra, antes de que se acabe el tiempo.' },
    { icono: StopCircle, color: AMARILLO, titulo: '¡Basta!', texto: 'Con todas las categorías completas podés cantar ¡Basta! y la ronda se corta para todos.' },
    { icono: Bot, color: VERDE, titulo: 'La IA corrige', texto: 'Revisa cada respuesta: 20 puntos si sos el único con una válida, 10 si es válida y nadie puso la misma, 5 si otro puso la misma y 0 si no vale.' },
    { icono: Users, color: AZUL, titulo: 'Contra la IA o con amigos', texto: 'Solo, jugás contra la máquina (vos elegís qué tan buena es). Con amigos, de 2 a 8, todos con la misma letra.' },
  ],
  ahorcado: [
    { icono: Lightbulb, color: AMARILLO, titulo: 'Mirá la pista', texto: 'Te decimos qué es (un jugador, un equipo, una selección, un estadio…) y cuántas letras tiene.' },
    { icono: Keyboard, color: VERDE, titulo: 'Probá letras', texto: 'Tocá las letras de la pantalla o usá el teclado de la compu. Las tildes no importan y la Ñ es una letra aparte.' },
    { icono: CircleDot, color: ROJO, titulo: 'Que no muera la redonda', texto: 'Cada letra que no está desinfla la pelota. Con 6 errores, se muere la redonda y perdés.' },
    { icono: Send, color: AZUL, titulo: 'Arriesgá', texto: 'Si ya la sabés, escribila entera. Si le errás, cuenta como un error.' },
    { icono: Trophy, color: VERDE, titulo: 'Puntos', texto: 'Más puntos cuanto más difícil, con menos errores y más rápido. Con amigos todos adivinan la misma palabra y suma más el que la completa primero.' },
  ],
  trivia: [
    { icono: HelpCircle, color: VERDE, titulo: 'Cuatro opciones', texto: 'Cada pregunta tiene cuatro respuestas posibles y una sola es la correcta.' },
    { icono: Timer, color: AMARILLO, titulo: 'Contra el reloj', texto: 'Jugando solo son 10 preguntas de 20 segundos. Si se acaba el tiempo, cuenta como sin responder.' },
    { icono: Zap, color: AZUL, titulo: 'Rápido suma más', texto: 'Sumás 10, 15 o 20 según la dificultad, y hasta 10 más por contestar rápido. Con 6 aciertos aprobás.' },
    { icono: Users, color: VERDE, titulo: 'Con amigos', texto: 'Todos ven la misma pregunta a la vez y suma más quien acierta más rápido (+5 al primero). La correcta se ve cuando respondieron todos o se acabó el tiempo.' },
  ],
  sopa_de_letras: [
    { icono: Grid3x3, color: VERDE, titulo: 'Buscá los nombres', texto: 'Las palabras de la lista están escondidas en la grilla. Fácil: en horizontal y vertical; medio: también en diagonal; difícil: en cualquier dirección y al revés.' },
    { icono: MousePointerClick, color: AZUL, titulo: 'Marcalas', texto: 'Arrastrá desde la primera hasta la última letra, o tocá la primera y después la última.' },
    { icono: Timer, color: AMARILLO, titulo: 'Antes de que termine el tiempo', texto: 'Fácil: 3 minutos, medio: 4 y difícil: 5. Si las encontrás todas, ganás y sumás puntos extra por el tiempo que sobró.' },
    { icono: Users, color: VERDE, titulo: 'Con amigos', texto: 'Todos tienen la misma grilla: cada palabra es del primero que la marca y se pinta con su color.' },
  ],
  memotest: [
    { icono: Layers, color: VERDE, titulo: 'Dá vuelta dos cartas', texto: 'Tocá una carta y después otra para ver qué tienen.' },
    { icono: Lightbulb, color: AMARILLO, titulo: 'Buscá los pares', texto: 'Si van juntas (un club y su apodo, un jugador y su selección…) quedan a la vista. Si no, se tapan de nuevo: acordate dónde estaban.' },
    { icono: Timer, color: AZUL, titulo: 'Rápido y sin vueltas', texto: 'Fácil: 6 pares en 2 minutos; medio: 8 en 3; difícil: 10 en 4. Sumás más con menos movimientos y más tiempo de sobra.' },
    { icono: Users, color: VERDE, titulo: 'Con amigos, por turnos', texto: 'Hasta 4 jugadores. Si encontrás un par, son 10 puntos y seguís jugando; si no, pasa el turno.' },
  ],
  trivia_diaria: [
    { icono: CalendarCheck, color: VERDE, titulo: 'Uno por día', texto: 'Todos juegan las mismas 5 preguntas (1 fácil, 2 medias y 2 difíciles). Se juega una sola vez por día.' },
    { icono: Timer, color: AMARILLO, titulo: '20 segundos', texto: 'Cada pregunta tiene 20 segundos. Si salís a la mitad, podés seguir después, pero el reloj sigue corriendo.' },
    { icono: Flame, color: NARANJA, titulo: 'Racha', texto: 'Sumá días seguidos jugando. Con 3 de 5 aciertos ganás el día.' },
    { icono: Share2, color: AZUL, titulo: 'Compartí', texto: 'Al terminar podés compartir tu resultado (sin decir las respuestas) y mirar la tabla del día.' },
  ],
  impostor: COMO_JUGAR_ONLINE,
};

export const comoJugarDe = (game: string): PasoComoJugar[] | undefined => COMO_JUGAR[game];
