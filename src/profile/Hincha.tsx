import { useId } from 'react';
import { varianteDe, type Hincha } from './hinchas';

// El hincha: personaje PROPIO en caricatura, estilo hincha de tribuna, canchero y con actitud. De
// cuerpo entero: camiseta suelta con los colores del club, short, medias bajas y zapatillas, con un
// vaso de plástico (bebida oscura con espuma y hielo, sin marcas) en una mano. Sin gorro: el pelo,
// la cara, la pose y los accesorios cambian según el club (ver varianteDe en hinchas.ts).
// Contorno negro marcado tipo historieta y sombras simples para dar volumen.
//
// NADA de texto, escudos, logos, sponsors ni marcas: sólo formas y colores (los tests lo controlan).
//
// Se dibuja en un cuadrado de 100×100 que se ve recortado en círculo: el personaje ocupa casi todo
// el círculo. Si es chiquito (ranking, salas) se encuadra de la cintura para arriba.

export const CHICO = 48;
const VISTA_GRANDE = '0 0 100 100';
const VISTA_CHICA = '18 3 64 64';

const LINEA = '#111111';
const TRAZO = 1.8;
const PIELES = ['#f6cfa5', '#e3a873', '#b8784a', '#7a4a2a'];
const PELOS = ['#1a1a1a', '#3b2314', '#7a4a22', '#d9a441'];
const BOCA = '#5a0f12';

type Punto = [number, number];
type Gesto = 'vaso' | 'cintura' | 'dedo' | 'puno';

interface Brazo {
  codo: Punto;
  mano: Punto;
  gesto: Gesto;
}

const HOMBRO_IZQ: Punto = [37.5, 40.5];
const HOMBRO_DER: Punto = [62.5, 40.5];

// Poses relajadas (nunca los dos brazos arriba)
const POSES: { izq: Brazo; der: Brazo }[] = [
  // mano en la cintura y el vaso en la otra
  { izq: { codo: [28, 51], mano: [35.5, 60], gesto: 'cintura' }, der: { codo: [71.5, 52], mano: [70.5, 61], gesto: 'vaso' } },
  // señalando con el dedo
  { izq: { codo: [28.5, 52], mano: [29.5, 61], gesto: 'vaso' }, der: { codo: [73, 44], mano: [80.5, 39.5], gesto: 'dedo' } },
  // "aguante" con el puño
  { izq: { codo: [28.5, 52], mano: [29.5, 61], gesto: 'vaso' }, der: { codo: [75, 47], mano: [71.5, 31], gesto: 'puno' } },
  // apoyado, con el vaso a la altura del pecho
  { izq: { codo: [32.5, 56], mano: [43.5, 49], gesto: 'vaso' }, der: { codo: [72, 51.5], mano: [64.5, 60], gesto: 'cintura' } },
];

const TORSO = 'M36,37.5 Q50,33.5 64,37.5 Q66.5,50 65.8,64.6 Q50,67.2 34.2,64.6 Q33.5,50 36,37.5 Z';
const SHORT = 'M35.2,62.4 L64.8,62.4 L66.4,77 L52.6,77.6 L50,70.2 L47.4,77.6 L33.6,77 Z';

function Vaso({ x, y }: { x: number; y: number }) {
  // Vaso de plástico: el fondo a la altura de la mano. Bebida oscura, espuma y dos hielos. Sin marcas.
  const arriba = y - 9.5;
  const abajo = y + 3.5;
  return (
    <g strokeLinejoin="round">
      <path d={`M${x - 5},${arriba} L${x + 5},${arriba} L${x + 3.8},${abajo} L${x - 3.8},${abajo} Z`} fill="#3a1a0c" />
      <path d={`M${x - 4.6},${arriba + 1.4} Q${x - 2},${arriba - 0.6} ${x},${arriba + 0.9} Q${x + 2.4},${arriba - 0.8} ${x + 4.6},${arriba + 1.4} L${x + 4.4},${arriba + 3} Q${x},${arriba + 4} ${x - 4.4},${arriba + 3} Z`} fill="#f1e2c0" />
      <rect x={x - 3.2} y={arriba + 2.6} width={2.8} height={2.8} rx={0.6} fill="#d6f0fb" opacity={0.85} transform={`rotate(-14 ${x - 1.8} ${arriba + 4})`} />
      <rect x={x + 0.6} y={arriba + 3.4} width={2.6} height={2.6} rx={0.6} fill="#d6f0fb" opacity={0.75} transform={`rotate(18 ${x + 1.9} ${arriba + 4.7})`} />
      {/* brillo del plástico */}
      <path d={`M${x - 3.6},${arriba + 5} L${x - 3},${abajo - 1.5}`} stroke="#ffffff" strokeWidth={0.9} opacity={0.55} strokeLinecap="round" />
      <path d={`M${x - 5},${arriba} L${x + 5},${arriba} L${x + 3.8},${abajo} L${x - 3.8},${abajo} Z`} fill="none" stroke={LINEA} strokeWidth={1.4} />
    </g>
  );
}

function BrazoSvg({ hombro, brazo, manga, piel, munequera }: {
  hombro: Punto; brazo: Brazo; manga: string; piel: string; munequera: [string, string] | null;
}) {
  const { codo, mano, gesto } = brazo;
  const medio: Punto = [hombro[0] + (codo[0] - hombro[0]) * 0.6, hombro[1] + (codo[1] - hombro[1]) * 0.6];
  const antebrazo = `M${medio[0]},${medio[1]} L${codo[0]},${codo[1]} L${mano[0]},${mano[1]}`;
  const mangaD = `M${hombro[0]},${hombro[1]} L${medio[0]},${medio[1]}`;
  // Dirección del antebrazo (para el dedo y la muñequera)
  const dx = mano[0] - codo[0];
  const dy = mano[1] - codo[1];
  const largo = Math.hypot(dx, dy) || 1;
  const ux = dx / largo;
  const uy = dy / largo;
  const muneca: Punto = [mano[0] - ux * 4.2, mano[1] - uy * 4.2];
  const tramo = (k: number) => `M${muneca[0] - ux * k},${muneca[1] - uy * k} L${muneca[0] + ux * k},${muneca[1] + uy * k}`;
  return (
    <g strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d={antebrazo} stroke={LINEA} strokeWidth={6.4 + TRAZO * 2} />
      <path d={antebrazo} stroke={piel} strokeWidth={6.4} />
      {munequera && (
        <>
          <path d={tramo(1.6)} stroke={LINEA} strokeWidth={8.4} strokeLinecap="butt" />
          <path d={tramo(1.2)} stroke={munequera[0]} strokeWidth={6.8} strokeLinecap="butt" />
          <path d={tramo(0.4)} stroke={munequera[1]} strokeWidth={6.8} strokeLinecap="butt" />
        </>
      )}
      {/* manga suelta (la camiseta es un poco grande) */}
      <path d={mangaD} stroke={LINEA} strokeWidth={11 + TRAZO * 2} />
      <path d={mangaD} stroke={manga} strokeWidth={11} />
      <path d={mangaD} stroke="#000000" strokeWidth={4} opacity={0.12} transform="translate(1.6 1.6)" />
      {gesto === 'vaso' && <Vaso x={mano[0]} y={mano[1]} />}
      {gesto === 'dedo' && (
        <>
          <path d={`M${mano[0]},${mano[1]} L${mano[0] + ux * 6.5},${mano[1] + uy * 6.5}`} stroke={LINEA} strokeWidth={2.6 + TRAZO * 2} />
          <path d={`M${mano[0]},${mano[1]} L${mano[0] + ux * 6.5},${mano[1] + uy * 6.5}`} stroke={piel} strokeWidth={2.6} />
        </>
      )}
      <circle cx={mano[0]} cy={mano[1]} r={gesto === 'puno' ? 4.4 : 3.8} fill={piel} stroke={LINEA} strokeWidth={TRAZO} />
      {gesto === 'puno' && (
        <path d={`M${mano[0] - 2.6},${mano[1] - 1} L${mano[0] + 2.6},${mano[1] - 1} M${mano[0] - 2.4},${mano[1] + 1.2} L${mano[0] + 2.4},${mano[1] + 1.2}`} stroke={LINEA} strokeWidth={0.9} />
      )}
      {gesto === 'vaso' && (
        // dedos sobre el vaso
        <path d={`M${mano[0] - 2.2},${mano[1] - 1.6} L${mano[0] + 2.2},${mano[1] - 1.6}`} stroke={LINEA} strokeWidth={0.9} />
      )}
    </g>
  );
}

function Camiseta({ hincha, clip }: { hincha: Hincha; clip: string }) {
  const [p, s, t] = hincha.camiseta;
  const colores = t ? [p, s, t] : [p, s];
  let dibujo;
  switch (hincha.diseno) {
    case 'rayas':
      dibujo = Array.from({ length: 5 }, (_, k) => (
        <rect key={k} x={33 + k * 6.8} y={32} width={6.9} height={38} fill={colores[k % colores.length]} />
      ));
      break;
    case 'aros':
      dibujo = Array.from({ length: 8 }, (_, k) => (
        <rect key={k} x={32} y={32 + k * 4.8} width={36} height={4.9} fill={colores[k % colores.length]} />
      ));
      break;
    case 'franja':
      dibujo = (
        <>
          <rect x={32} y={32} width={36} height={38} fill={p} />
          <rect x={32} y={46.5} width={36} height={7.5} fill={s} />
        </>
      );
      break;
    case 'banda':
      dibujo = (
        <>
          <rect x={32} y={32} width={36} height={38} fill={p} />
          <polygon points="31,44 40.5,32.5 70,61 60.5,71" fill={s} />
        </>
      );
      break;
    case 'mitades':
      dibujo = (
        <>
          <rect x={32} y={32} width={18} height={38} fill={p} />
          <rect x={50} y={32} width={18} height={38} fill={s} />
        </>
      );
      break;
    case 'v':
      dibujo = (
        <>
          <rect x={32} y={32} width={36} height={38} fill={p} />
          <polyline points="35.5,35.5 50,53 64.5,35.5" fill="none" stroke={s} strokeWidth={6} strokeLinejoin="miter" />
        </>
      );
      break;
    default:
      dibujo = <rect x={32} y={32} width={36} height={38} fill={p} />;
  }
  return (
    <g>
      <clipPath id={clip}>
        <path d={TORSO} />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        {dibujo}
        {/* volumen: sombra a la derecha, luz a la izquierda y pliegues de la tela */}
        <path d="M57,34 Q67,50 63.5,70 L70,70 L70,32 Z" fill="#000000" opacity={0.2} />
        <path d="M36,40 Q38.5,52 37,64 L33,64 L33,40 Z" fill="#ffffff" opacity={0.14} />
        <path d="M41,56 Q44,60 42.5,64.5 M57,55 Q55,59 56.5,64.5" stroke="#000000" strokeWidth={0.9} opacity={0.25} fill="none" />
      </g>
      {/* cuello */}
      <path d="M44.2,35.9 Q50,41.6 55.8,35.9" fill="none" stroke={LINEA} strokeWidth={2.6 + TRAZO} strokeLinecap="round" />
      <path d="M44.2,35.9 Q50,41.6 55.8,35.9" fill="none" stroke={s === p ? '#ffffff' : s} strokeWidth={2.4} strokeLinecap="round" />
      <path d={TORSO} fill="none" stroke={LINEA} strokeWidth={TRAZO} strokeLinejoin="round" />
    </g>
  );
}

// Pelo atrás de la cabeza (sólo el largo)
function PeloAtras({ pelo, color }: { pelo: number; color: string }) {
  if (pelo !== 1) return null;
  return (
    <path d="M38.2,17 Q37,8.5 50,7.6 Q63,8.5 61.8,17 L63.6,37.2 Q60.4,39.6 57.4,36.6 L57.8,28 L42.2,28 L42.6,36.6 Q39.6,39.6 36.4,37.2 Z"
      fill={color} stroke={LINEA} strokeWidth={TRAZO} strokeLinejoin="round" />
  );
}

function Pelo({ pelo, color }: { pelo: number; color: string }) {
  const comun = { fill: color, stroke: LINEA, strokeWidth: TRAZO, strokeLinejoin: 'round' as const };
  switch (pelo) {
    case 0: // rulos
      return (
        <g {...comun}>
          <path d="M38.6,20.5 Q38.8,8.6 50,8.4 Q61.2,8.6 61.4,20.5 Q56,14.6 50,15 Q44,14.6 38.6,20.5 Z" />
          {[[39.6, 17.4], [41.4, 12.2], [45.4, 9.2], [50.4, 8.2], [55.2, 9.2], [59.2, 12.4], [60.8, 17.4], [47.8, 13], [53, 13.2]].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={3.9} />
          ))}
        </g>
      );
    case 1: // largo (con raya al costado)
      return <path {...comun} d="M38.4,21 Q38.2,8.4 50,8.2 Q61.8,8.4 61.6,21 Q58,14 51,14.6 Q46,15.2 42.6,18 Q40.4,19.6 38.4,21 Z" />;
    case 2: // rapado a los costados, con cresta corta arriba
      return (
        <g>
          <path d="M38.8,23 Q38.4,15.4 41.4,13.2 Q40.8,17.6 41.2,23 Z" fill={color} opacity={0.4} />
          <path d="M61.2,23 Q61.6,15.4 58.6,13.2 Q59.2,17.6 58.8,23 Z" fill={color} opacity={0.4} />
          {/* pelo corto en punta (no es un gorro: borde en puntas y mechones) */}
          <path {...comun} d="M41.6,15.4 L42.2,9.6 L44.4,11.6 L45.6,7.2 L47.8,10.2 L50,6.2 L52.2,10.2 L54.4,7.2 L55.6,11.6 L57.8,9.6 L58.4,15.4 Q54.6,13 50,13.2 Q45.4,13 41.6,15.4 Z" />
          <path d="M46.4,12.4 L47.4,9.8 M50,12 L50,8.6 M53.6,12.4 L52.6,9.8" stroke={LINEA} strokeWidth={0.8} opacity={0.5} />
        </g>
      );
    default: // flequillo
      return <path {...comun} d="M38.4,21.5 Q37.8,7.8 50,7.8 Q62.2,7.8 61.6,21.5 L60,16.6 L57.4,19.2 L55.2,15.8 L52.4,18.8 L49.8,15.4 L47.2,18.8 L44.6,15.8 L42.2,19.2 L40.2,16.6 Z" />;
  }
}

function Cara({ cara, vello, colorPelo }: { cara: number; vello: number; colorPelo: string }) {
  const colorCeja = colorPelo === PELOS[3] ? '#8a5a1c' : LINEA;
  const ceja = (d: string) => <path d={d} stroke={colorCeja} strokeWidth={2} strokeLinecap="round" fill="none" />;
  const ojo = (cx: number) => (
    <g>
      <ellipse cx={cx} cy={20.4} rx={1.9} ry={2.3} fill="#ffffff" stroke={LINEA} strokeWidth={0.9} />
      <circle cx={cx + 0.4} cy={20.8} r={1.1} fill={LINEA} />
    </g>
  );
  const cerrado = (cx: number) => <path d={`M${cx - 2},${20.8} Q${cx},${22.6} ${cx + 2},${20.8}`} stroke={LINEA} strokeWidth={1.3} fill="none" strokeLinecap="round" />;
  return (
    <g>
      {/* barba (atrás de la boca) */}
      {vello === 1 && (
        <path d="M38.8,21 Q39.2,33.8 50,34.8 Q60.8,33.8 61.2,21 Q59.4,27.6 56.4,29.4 Q50,27 43.6,29.4 Q40.6,27.6 38.8,21 Z"
          fill={colorPelo} stroke={LINEA} strokeWidth={1.2} strokeLinejoin="round" />
      )}
      {cara === 0 && (
        <>
          {/* canchero: una ceja levantada y sonrisa de costado */}
          {ceja('M42.6,17 L47.6,16.4')}
          {ceja('M52.4,15.2 L57.6,16.4')}
          {ojo(45.4)}
          {ojo(54.6)}
          <path d="M45.4,26.4 Q51,30.8 55.6,25 Q50.6,27.6 45.4,26.4 Z" fill="#ffffff" stroke={LINEA} strokeWidth={1.2} strokeLinejoin="round" />
        </>
      )}
      {cara === 1 && (
        <>
          {/* gritando el gol */}
          {ceja('M42.4,15.6 L47.6,17.6')}
          {ceja('M57.6,15.6 L52.4,17.6')}
          {cerrado(45.4)}
          {cerrado(54.6)}
          <path d="M45.2,25 Q50,23.8 54.8,25 Q54.4,31.4 50,31.6 Q45.6,31.4 45.2,25 Z" fill={BOCA} stroke={LINEA} strokeWidth={1.2} strokeLinejoin="round" />
          <path d="M46.2,25.2 Q50,24.4 53.8,25.2 L53.6,26.4 Q50,25.8 46.4,26.4 Z" fill="#ffffff" />
          <ellipse cx={50} cy={29.8} rx={2.4} ry={1.3} fill="#e0505a" />
        </>
      )}
      {cara === 2 && (
        <>
          {/* guiño */}
          {ceja('M42.6,16.6 L47.6,16.8')}
          {ceja('M52.4,16 L57.6,16.8')}
          {cerrado(45.4)}
          {ojo(54.6)}
          <path d="M45,25.4 Q50,30.8 55,25.4 Q50,27.2 45,25.4 Z" fill="#ffffff" stroke={LINEA} strokeWidth={1.2} strokeLinejoin="round" />
        </>
      )}
      {/* nariz */}
      <path d="M50.2,20.8 Q52.6,23.8 49.4,24.4" stroke={LINEA} strokeWidth={1.1} fill="none" strokeLinecap="round" />
      {/* bigote */}
      {vello === 2 && (
        <path d="M44.8,25 Q47.4,22.8 50,24.2 Q52.6,22.8 55.2,25 Q52.6,26 50,25.4 Q47.4,26 44.8,25 Z"
          fill={colorPelo} stroke={LINEA} strokeWidth={1} strokeLinejoin="round" />
      )}
    </g>
  );
}

export default function HinchaSvg({ hincha, size = 84 }: { hincha: Hincha; size?: number }) {
  const clip = `torso-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const v = varianteDe(hincha.id);
  const pose = POSES[v.pose];
  const piel = PIELES[v.piel];
  const colorPelo = PELOS[v.colorPelo];
  const [p, s] = hincha.camiseta;
  const mangaIzq = p;
  const mangaDer = hincha.diseno === 'mitades' ? s : p;
  // Muñequera con los colores del club, en la mano que no tiene el vaso
  const munequera: [string, string] | null = v.accesorio === 2 ? [p, s] : null;
  return (
    <svg viewBox={size < CHICO ? VISTA_CHICA : VISTA_GRANDE} width={size} height={size} aria-hidden="true" focusable="false" style={{ display: 'block' }}>
      <rect x={-10} y={-10} width={120} height={120} fill={hincha.fondo} />
      {/* luz de fondo */}
      <circle cx={50} cy={46} r={34} fill="#ffffff" opacity={0.12} />
      {/* sombra en el piso */}
      <ellipse cx={50} cy={95} rx={22} ry={3.2} fill="#000000" opacity={0.25} />

      {/* piernas, medias bajas y zapatillas */}
      <g stroke={LINEA} strokeWidth={TRAZO} strokeLinejoin="round">
        <rect x={38.4} y={75} width={7.6} height={12.4} fill={piel} />
        <rect x={54} y={75} width={7.6} height={12.4} fill={piel} />
        <rect x={38} y={85.4} width={8.4} height={4.4} rx={1} fill={hincha.medias} />
        <rect x={53.6} y={85.4} width={8.4} height={4.4} rx={1} fill={hincha.medias} />
        <path d="M36.4,88.6 h10.6 v3.6 q0,2.2 -2.2,2.2 h-10.2 q-2,0 -1.7,-2 q0.6,-3 3.5,-3.8 z" fill="#ffffff" />
        <path d="M53,88.6 h10.6 q2.9,0.8 3.5,3.8 q0.3,2 -1.7,2 h-10.2 q-2.2,0 -2.2,-2.2 z" fill="#ffffff" />
      </g>
      <path d="M33.2,92.6 h13.4 M53.4,92.6 h13.4" stroke="#8a8f96" strokeWidth={1.2} />

      {/* short (suelto) con sombra */}
      <path d={SHORT} fill={hincha.short} stroke={LINEA} strokeWidth={TRAZO} strokeLinejoin="round" />
      <path d="M53,64 L64.6,64 L65.9,76.4 L54.6,77 Z" fill="#000000" opacity={0.16} />

      {/* cuello */}
      <rect x={45.6} y={29.5} width={8.8} height={8} fill={piel} stroke={LINEA} strokeWidth={TRAZO} />

      {/* camiseta un poco grande */}
      <Camiseta hincha={hincha} clip={clip} />

      {/* cadenita */}
      {v.accesorio === 1 && (
        <g>
          <path d="M44.6,38 Q50,45 55.4,38" fill="none" stroke="#e2b93b" strokeWidth={1.2} strokeDasharray="1.2 0.8" />
          <circle cx={50} cy={43.6} r={1.4} fill="#e2b93b" stroke={LINEA} strokeWidth={0.7} />
        </g>
      )}

      {/* brazos (la muñequera, si tiene, va en la mano libre) */}
      <BrazoSvg hombro={HOMBRO_IZQ} brazo={pose.izq} manga={mangaIzq} piel={piel} munequera={pose.izq.gesto !== 'vaso' ? munequera : null} />
      <BrazoSvg hombro={HOMBRO_DER} brazo={pose.der} manga={mangaDer} piel={piel} munequera={pose.der.gesto !== 'vaso' ? munequera : null} />

      {/* cabeza */}
      <PeloAtras pelo={v.pelo} color={colorPelo} />
      <circle cx={38.4} cy={22.2} r={2.8} fill={piel} stroke={LINEA} strokeWidth={TRAZO} />
      <circle cx={61.6} cy={22.2} r={2.8} fill={piel} stroke={LINEA} strokeWidth={TRAZO} />
      <circle cx={50} cy={21} r={11.6} fill={piel} stroke={LINEA} strokeWidth={TRAZO} />
      <path d="M41,27 Q50,35 59,27 Q55,32.6 50,32.6 Q45,32.6 41,27 Z" fill="#000000" opacity={0.08} />
      <Cara cara={v.cara} vello={v.vello} colorPelo={colorPelo} />
      <Pelo pelo={v.pelo} color={colorPelo} />
    </svg>
  );
}
