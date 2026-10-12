import { useId } from 'react';
import { varianteDe, type Hincha } from './hinchas';

// El hincha: personaje PROPIO en caricatura, hincha de barrio, de tribuna. Flaco y desgarbado, con
// brazos y piernas finitos y cabeza grande; pelo largo (con flequillo o desprolijo), sonrisa enorme
// con los dientes y ojos achinados de risa. En una mano, el vaso de fernet con coca (bebida casi negra
// con espuma clara arriba, sin marcas); con la otra señala, hace pulgar arriba o la apoya en la
// cintura. Camiseta un poco grande con los colores del club, short corto, medias bajas y zapatillas
// blancas grandes. Sin gorro. Contorno negro marcado tipo historieta y sombras simples.
//
// NADA de texto, escudos, logos, sponsors ni marcas: sólo formas y colores (los tests lo controlan).
//
// Se dibuja en un cuadrado de 100×100 que se ve recortado en círculo: el personaje ocupa casi todo
// el círculo. Si es chiquito (ranking, salas) se encuadra de la cintura para arriba.

export const CHICO = 48;
const VISTA_GRANDE = '0 0 100 100';
const VISTA_CHICA = '17 4 66 66';

const LINEA = '#111111';
const TRAZO = 1.8;
const PIELES = ['#f6cfa5', '#e3a873', '#b8784a', '#7a4a2a'];
const PELOS = ['#1a1a1a', '#3b2314', '#6e4220', '#c9963a'];
const BOCA = '#4a0c10';
const FERNET = '#120705';
const ESPUMA = '#f3e8cf';

type Punto = [number, number];
type Gesto = 'vaso' | 'dedo' | 'pulgar' | 'cintura';

interface Brazo {
  codo: Punto;
  mano: Punto;
  gesto: Gesto;
}

// Hombros angostos (es flaco); la manga suelta de la camiseta los hace parecer un poco más anchos
const HOMBRO_IZQ: Punto = [40.5, 45.5];
const HOMBRO_DER: Punto = [59.5, 45.5];

// El vaso siempre en la mano izquierda (del dibujo): a la altura del pecho o abajo
const VASO_ARRIBA: Brazo = { codo: [32.5, 58], mano: [38.5, 53], gesto: 'vaso' };
const VASO_ABAJO: Brazo = { codo: [34.5, 58.5], mano: [31.5, 67], gesto: 'vaso' };
// La otra mano: señalando, pulgar arriba o en la cintura
const OTRA: Record<'dedo' | 'pulgar' | 'cintura', Brazo> = {
  dedo: { codo: [68, 52.5], mano: [76.5, 46.5], gesto: 'dedo' },
  pulgar: { codo: [70.5, 57.5], mano: [70.5, 48], gesto: 'pulgar' },
  cintura: { codo: [70.5, 56], mano: [62.5, 64.5], gesto: 'cintura' },
};
const POSES: { izq: Brazo; der: Brazo }[] = [
  { izq: VASO_ARRIBA, der: OTRA.dedo },
  { izq: VASO_ABAJO, der: OTRA.pulgar },
  { izq: VASO_ARRIBA, der: OTRA.cintura },
  { izq: VASO_ABAJO, der: OTRA.dedo },
  { izq: VASO_ARRIBA, der: OTRA.pulgar },
  { izq: VASO_ABAJO, der: OTRA.cintura },
];

// Camiseta un poco grande (más ancha abajo) sobre un cuerpo flaco
const TORSO = 'M39.5,43.2 Q50,39.8 60.5,43.2 Q62.8,55 63.6,67.4 Q50,69.6 36.4,67.4 Q37.2,55 39.5,43.2 Z';
// Short corto y ancho
const SHORT = 'M37.6,65.4 L62.4,65.4 L63.8,74.2 L51.6,74.8 L50,70.6 L48.4,74.8 L36.2,74.2 Z';

function Vaso({ x, y }: { x: number; y: number }) {
  // Vaso de plástico con fernet con coca: casi negro, espuma clara bien marcada. Sin marcas.
  const arriba = y - 10.5;
  const abajo = y + 3.5;
  const borde = `M${x - 5.4},${arriba} L${x + 5.4},${arriba} L${x + 4},${abajo} L${x - 4},${abajo} Z`;
  return (
    <g strokeLinejoin="round">
      <path d={borde} fill={FERNET} />
      {/* espuma: gruesa, con burbujas que asoman por arriba del vaso */}
      <path
        d={`M${x - 5.2},${arriba + 3.4} L${x - 5.4},${arriba} Q${x - 4.6},${arriba - 2.2} ${x - 2.6},${arriba - 1} Q${x - 1.2},${arriba - 2.8} ${x + 0.8},${arriba - 1.2} Q${x + 2.6},${arriba - 2.6} ${x + 4},${arriba - 0.8} Q${x + 5.6},${arriba - 0.6} ${x + 5.4},${arriba} L${x + 5.2},${arriba + 3.4} Q${x},${arriba + 4.6} ${x - 5.2},${arriba + 3.4} Z`}
        fill={ESPUMA} stroke={LINEA} strokeWidth={1.1}
      />
      <circle cx={x - 2.2} cy={arriba + 1.6} r={0.7} fill="#d8c9a6" />
      <circle cx={x + 2} cy={arriba + 2.2} r={0.6} fill="#d8c9a6" />
      {/* brillo del plástico */}
      <path d={`M${x - 3.8},${arriba + 6} L${x - 3.2},${abajo - 1.6}`} stroke="#ffffff" strokeWidth={1} opacity={0.5} strokeLinecap="round" />
      <path d={borde} fill="none" stroke={LINEA} strokeWidth={1.5} />
    </g>
  );
}

function BrazoSvg({ hombro, brazo, manga, piel, munequera }: {
  hombro: Punto; brazo: Brazo; manga: string; piel: string; munequera: [string, string] | null;
}) {
  const { codo, mano, gesto } = brazo;
  const medio: Punto = [hombro[0] + (codo[0] - hombro[0]) * 0.5, hombro[1] + (codo[1] - hombro[1]) * 0.5];
  const brazoD = `M${hombro[0]},${hombro[1]} L${codo[0]},${codo[1]} L${mano[0]},${mano[1]}`;
  const mangaD = `M${hombro[0]},${hombro[1]} L${medio[0]},${medio[1]}`;
  const dx = mano[0] - codo[0];
  const dy = mano[1] - codo[1];
  const largo = Math.hypot(dx, dy) || 1;
  const ux = dx / largo;
  const uy = dy / largo;
  const muneca: Punto = [mano[0] - ux * 3.6, mano[1] - uy * 3.6];
  const tramo = (k: number) => `M${muneca[0] - ux * k},${muneca[1] - uy * k} L${muneca[0] + ux * k},${muneca[1] + uy * k}`;
  return (
    <g strokeLinecap="round" strokeLinejoin="round" fill="none">
      {/* brazo finito */}
      <path d={brazoD} stroke={LINEA} strokeWidth={3.6 + TRAZO * 2} />
      <path d={brazoD} stroke={piel} strokeWidth={3.6} />
      {munequera && (
        <>
          <path d={tramo(1.5)} stroke={LINEA} strokeWidth={6.4} strokeLinecap="butt" />
          <path d={tramo(1.1)} stroke={munequera[0]} strokeWidth={4.8} strokeLinecap="butt" />
          <path d={tramo(0.35)} stroke={munequera[1]} strokeWidth={4.8} strokeLinecap="butt" />
        </>
      )}
      {/* manga suelta y ancha (la camiseta le queda grande) */}
      <path d={mangaD} stroke={LINEA} strokeWidth={9 + TRAZO * 2} />
      <path d={mangaD} stroke={manga} strokeWidth={9} />
      <path d={mangaD} stroke="#000000" strokeWidth={3} opacity={0.14} transform="translate(1.4 1.4)" />
      {gesto === 'vaso' && <Vaso x={mano[0]} y={mano[1]} />}
      {gesto === 'dedo' && (
        <>
          <path d={`M${mano[0]},${mano[1]} L${mano[0] + ux * 6.2},${mano[1] + uy * 6.2}`} stroke={LINEA} strokeWidth={2.2 + TRAZO * 2} />
          <path d={`M${mano[0]},${mano[1]} L${mano[0] + ux * 6.2},${mano[1] + uy * 6.2}`} stroke={piel} strokeWidth={2.2} />
        </>
      )}
      {gesto === 'pulgar' && (
        <>
          <path d={`M${mano[0] - 0.6},${mano[1] - 1.6} L${mano[0] - 0.6},${mano[1] - 7}`} stroke={LINEA} strokeWidth={2.4 + TRAZO * 2} />
          <path d={`M${mano[0] - 0.6},${mano[1] - 1.6} L${mano[0] - 0.6},${mano[1] - 7}`} stroke={piel} strokeWidth={2.4} />
        </>
      )}
      <circle cx={mano[0]} cy={mano[1]} r={gesto === 'pulgar' ? 3.6 : 3.1} fill={piel} stroke={LINEA} strokeWidth={TRAZO} />
      {gesto === 'pulgar' && (
        <path d={`M${mano[0] - 2.2},${mano[1] + 0.4} L${mano[0] + 2.4},${mano[1] + 0.4} M${mano[0] - 2},${mano[1] + 2} L${mano[0] + 2},${mano[1] + 2}`} stroke={LINEA} strokeWidth={0.8} />
      )}
      {gesto === 'vaso' && <path d={`M${mano[0] - 1.8},${mano[1] - 1.2} L${mano[0] + 1.8},${mano[1] - 1.2}`} stroke={LINEA} strokeWidth={0.8} />}
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
        <rect key={k} x={35 + k * 6} y={38} width={6.1} height={34} fill={colores[k % colores.length]} />
      ));
      break;
    case 'aros':
      dibujo = Array.from({ length: 8 }, (_, k) => (
        <rect key={k} x={34} y={38 + k * 4.4} width={32} height={4.5} fill={colores[k % colores.length]} />
      ));
      break;
    case 'franja':
      dibujo = (
        <>
          <rect x={34} y={38} width={32} height={34} fill={p} />
          <rect x={34} y={51} width={32} height={6.6} fill={s} />
        </>
      );
      break;
    case 'banda':
      dibujo = (
        <>
          <rect x={34} y={38} width={32} height={34} fill={p} />
          <polygon points="34,48 41.5,39 67,63 60,71.5" fill={s} />
        </>
      );
      break;
    case 'mitades':
      dibujo = (
        <>
          <rect x={34} y={38} width={16} height={34} fill={p} />
          <rect x={50} y={38} width={16} height={34} fill={s} />
        </>
      );
      break;
    case 'v':
      dibujo = (
        <>
          <rect x={34} y={38} width={32} height={34} fill={p} />
          <polyline points="38.4,41.6 50,56.5 61.6,41.6" fill="none" stroke={s} strokeWidth={5.2} strokeLinejoin="miter" />
        </>
      );
      break;
    default:
      dibujo = <rect x={34} y={38} width={32} height={34} fill={p} />;
  }
  return (
    <g>
      <clipPath id={clip}>
        <path d={TORSO} />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        {dibujo}
        {/* volumen: sombra a la derecha, luz a la izquierda y pliegues de la tela suelta */}
        <path d="M56,40 Q65,55 61.5,72 L68,72 L68,38 Z" fill="#000000" opacity={0.2} />
        <path d="M39.5,46 Q40.5,56 39.4,66 L35,66 L35,46 Z" fill="#ffffff" opacity={0.14} />
        <path d="M43,58 Q45.6,62.4 44,67 M56.6,57 Q54.6,61.6 56.2,67 M49,61 Q50,64.5 49.2,68" stroke="#000000" strokeWidth={0.8} opacity={0.28} fill="none" />
      </g>
      <path d="M45.4,41.6 Q50,46.4 54.6,41.6" fill="none" stroke={LINEA} strokeWidth={2.4 + TRAZO} strokeLinecap="round" />
      <path d="M45.4,41.6 Q50,46.4 54.6,41.6" fill="none" stroke={s === p ? '#ffffff' : s} strokeWidth={2.2} strokeLinecap="round" />
      <path d={TORSO} fill="none" stroke={LINEA} strokeWidth={TRAZO} strokeLinejoin="round" />
    </g>
  );
}

// Pelo de atrás (cae por detrás de la cabeza, hasta los hombros)
function PeloAtras({ pelo, color }: { pelo: number; color: string }) {
  const comun = { fill: color, stroke: LINEA, strokeWidth: TRAZO, strokeLinejoin: 'round' as const };
  switch (pelo) {
    case 0: // largo con flequillo
    case 2: // largo con raya al medio
      return <path {...comun} d="M35,22 Q34,7 50,6.4 Q66,7 65,22 L66.6,44 Q63.4,47 60.4,44.4 L60.6,35 L39.4,35 L39.6,44.4 Q36.6,47 33.4,44 Z" />;
    case 1: // desprolijo: mechones para todos lados, hasta el cuello
      return <path {...comun} d="M34.6,24 L31,27 L34.4,29.6 L32,34 L36.6,34.4 L37,39.4 L40.8,36.6 L41,30 L59,30 L59.2,36.6 L63,39.4 L63.4,34.4 L68,34 L65.6,29.6 L69,27 L65.4,24 Q65,8 50,7 Q35,8 34.6,24 Z" />;
    default: // melena con rulos
      return (
        <g {...comun}>
          {[[35.2, 20], [33.6, 27], [34.4, 34], [37.6, 40], [64.8, 20], [66.4, 27], [65.6, 34], [62.4, 40]].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={4.6} />
          ))}
        </g>
      );
  }
}

// Pelo de adelante (flequillo, mechones o rulos sobre la frente)
function PeloAdelante({ pelo, color }: { pelo: number; color: string }) {
  const comun = { fill: color, stroke: LINEA, strokeWidth: TRAZO, strokeLinejoin: 'round' as const };
  switch (pelo) {
    case 0: // flequillo largo y desparejo
      return <path {...comun} d="M35.4,23.2 Q35,8.6 50,8.4 Q65,8.6 64.6,23.2 L62.6,18.6 L60.6,22.4 L58.4,17.6 L55.6,21.8 L53.2,17.2 L50.4,21.4 L47.8,17.2 L45,21.8 L42.6,17.6 L40,22 L37.8,18.6 Z" />;
    case 1: // desprolijo, con mechas paradas
      return <path {...comun} d="M35.4,24 Q34.8,9 50,8.6 Q65.2,9 64.6,24 Q62,17.2 57.4,15.6 L59.2,11 L54.6,14.2 L52.4,9.4 L50.4,14.6 L46.6,10.4 L46,15 Q39.6,16.4 35.4,24 Z" />;
    case 2: // raya al medio, cae a los costados
      return <path {...comun} d="M35.2,26 Q34.4,9 50,8.4 Q65.6,9 64.8,26 Q62.6,17 50.8,14.6 L50,11.6 L49.2,14.6 Q37.4,17 35.2,26 Z" />;
    default: // rulos
      return (
        <g {...comun}>
          <path d="M35.6,22 Q35.6,9 50,8.6 Q64.4,9 64.4,22 Q57,15.4 50,15.6 Q43,15.4 35.6,22 Z" />
          {[[37.2, 16.6], [40.4, 11.6], [45, 8.8], [50, 7.8], [55, 8.8], [59.6, 11.6], [62.8, 16.6], [44.4, 14], [50, 13], [55.6, 14]].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={3.8} />
          ))}
        </g>
      );
  }
}

function Cara({ cara, vello, colorPelo }: { cara: number; vello: number; colorPelo: string }) {
  const colorCeja = colorPelo === PELOS[3] ? '#7a5218' : LINEA;
  const ceja = (d: string) => <path d={d} stroke={colorCeja} strokeWidth={2.2} strokeLinecap="round" fill="none" />;
  // Ojos chicos y achinados de risa
  const achinado = (cx: number) => <path d={`M${cx - 2.6},${23.6} Q${cx},${21} ${cx + 2.6},${23.6}`} stroke={LINEA} strokeWidth={1.7} fill="none" strokeLinecap="round" />;
  const pliegue = (cx: number, lado: number) => <path d={`M${cx + lado * 3.2},${24.6} l${lado * 1.4},${0.8}`} stroke={LINEA} strokeWidth={0.8} strokeLinecap="round" />;
  return (
    <g>
      {/* barba de pocos días */}
      {vello === 2 && (
        <g>
          <path d="M36.6,27 Q37.4,39.6 50,40.6 Q62.6,39.6 63.4,27 Q62,36 50,36.6 Q38,36 36.6,27 Z" fill={colorPelo} opacity={0.32} />
          {[[40, 34], [43, 36.6], [47, 37.8], [53, 37.8], [57, 36.6], [60, 34], [41.6, 31.6], [58.4, 31.6], [50, 39]].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={0.45} fill={LINEA} opacity={0.5} />
          ))}
        </g>
      )}
      {cara === 2 ? (
        <>
          {/* canchero: una ceja bien levantada */}
          {ceja('M40.6,19.8 L46,19.2')}
          {ceja('M54,17.4 L59.6,18.6')}
        </>
      ) : (
        <>
          {ceja('M40.6,19.4 L46,18.6')}
          {ceja('M54,18.6 L59.4,19.4')}
        </>
      )}
      {achinado(43.4)}
      {achinado(56.6)}
      {pliegue(43.4, -1)}
      {pliegue(56.6, 1)}
      {/* nariz grande de caricatura */}
      <path d="M49.4,22.6 Q55.6,29.6 50.2,30.4 Q47.6,30.6 47.2,29" fill="none" stroke={LINEA} strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" />
      {/* cachetes */}
      <ellipse cx={39.6} cy={29.4} rx={2.4} ry={1.5} fill="#ff6b6b" opacity={0.35} />
      <ellipse cx={60.4} cy={29.4} rx={2.4} ry={1.5} fill="#ff6b6b" opacity={0.35} />
      {cara === 1 ? (
        // riéndose a carcajadas: boca bien abierta, dientes de arriba y lengua
        <g>
          <path d="M40.4,31.2 Q50,30 59.6,31.2 Q58.6,40.8 50,41 Q41.4,40.8 40.4,31.2 Z" fill={BOCA} stroke={LINEA} strokeWidth={1.4} strokeLinejoin="round" />
          <path d="M41.4,31.6 Q50,30.6 58.6,31.6 L58.2,34 Q50,33.2 41.8,34 Z" fill="#ffffff" />
          <path d="M45,31.2 L45.2,33.6 M48.4,30.9 L48.4,33.4 M51.6,30.9 L51.6,33.4 M55,31.2 L54.8,33.6" stroke={LINEA} strokeWidth={0.6} />
          <ellipse cx={50} cy={38.6} rx={3.8} ry={1.9} fill="#e0505a" />
        </g>
      ) : (
        // sonrisa enorme mostrando los dientes (en la canchera, un poco de costado)
        <g>
          <path d={cara === 2 ? 'M40,31 Q50,43.4 60.4,29.4 Q50,34.4 40,31 Z' : 'M39.6,30.6 Q50,43.8 60.4,30.6 Q50,34.4 39.6,30.6 Z'}
            fill="#ffffff" stroke={LINEA} strokeWidth={1.4} strokeLinejoin="round" />
          <path d={cara === 2 ? 'M41.4,32.8 Q50,36.6 58.8,32' : 'M41.2,32.6 Q50,36.8 58.8,32.6'} fill="none" stroke={LINEA} strokeWidth={0.8} />
          <path d="M45,32.6 L45.4,37 M48.4,33.4 L48.6,38.2 M51.8,33.4 L51.6,38.2 M55.2,32.6 L54.8,37" stroke={LINEA} strokeWidth={0.6} />
        </g>
      )}
      {/* bigote finito */}
      {vello === 1 && (
        <path d="M41.6,30.6 Q45.6,28.2 50,29.8 Q54.4,28.2 58.4,30.6" fill="none" stroke={colorPelo === PELOS[3] ? '#7a5218' : LINEA} strokeWidth={1.4} strokeLinecap="round" />
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
  const munequera: [string, string] | null = v.accesorio === 2 ? [p, s] : null;
  // Espejado (vaso en la otra mano), salvo si la camiseta tiene lado (mitades, banda diagonal)
  const espejo = v.espejo && hincha.diseno !== 'mitades' && hincha.diseno !== 'banda';
  return (
    <svg viewBox={size < CHICO ? VISTA_CHICA : VISTA_GRANDE} width={size} height={size} aria-hidden="true" focusable="false" style={{ display: 'block' }}>
      <rect x={-10} y={-10} width={120} height={120} fill={hincha.fondo} />
      <circle cx={50} cy={44} r={34} fill="#ffffff" opacity={0.12} />
      <ellipse cx={50} cy={95.4} rx={21} ry={3} fill="#000000" opacity={0.25} />

      {/* El dibujo se espeja en algunos clubes (vaso en la otra mano) */}
      <g transform={espejo ? 'translate(100 0) scale(-1 1)' : undefined}>
        {/* piernas finitas, medias bajas y zapatillas blancas grandes */}
        <g stroke={LINEA} strokeWidth={TRAZO} strokeLinejoin="round">
          <rect x={42.2} y={73} width={4} height={14.6} fill={piel} />
          <rect x={53.8} y={73} width={4} height={14.6} fill={piel} />
          <rect x={41.8} y={85.4} width={4.8} height={3.8} rx={0.8} fill={hincha.medias} />
          <rect x={53.4} y={85.4} width={4.8} height={3.8} rx={0.8} fill={hincha.medias} />
          <path d="M36,88.4 Q36.6,86.6 40.2,86.8 L46.6,87.2 Q48.8,87.4 48.8,90.4 L48.8,92.6 Q48.8,94.8 46.6,94.8 L35.4,94.8 Q32.8,94.8 33,92.4 Q33.4,89.4 36,88.4 Z" fill="#ffffff" />
          <path d="M64,88.4 Q63.4,86.6 59.8,86.8 L53.4,87.2 Q51.2,87.4 51.2,90.4 L51.2,92.6 Q51.2,94.8 53.4,94.8 L64.6,94.8 Q67.2,94.8 67,92.4 Q66.6,89.4 64,88.4 Z" fill="#ffffff" />
        </g>
        <path d="M33.2,92.8 h15.4 M51.4,92.8 h15.4" stroke="#8a8f96" strokeWidth={1.3} />
        <path d="M40,88.6 l2.2,1.6 M43,88.4 l2.2,1.6 M57,88.4 l-2.2,1.6 M60,88.6 l-2.2,1.6" stroke={LINEA} strokeWidth={0.7} />

        {/* short corto */}
        <path d={SHORT} fill={hincha.short} stroke={LINEA} strokeWidth={TRAZO} strokeLinejoin="round" />
        <path d="M53,66.6 L62.4,66.6 L63.6,73.8 L54.4,74.4 Z" fill="#000000" opacity={0.16} />

        {/* cuello finito */}
        <rect x={47.4} y={36} width={5.2} height={8} fill={piel} stroke={LINEA} strokeWidth={TRAZO} />

        <Camiseta hincha={hincha} clip={clip} />

        {v.accesorio === 1 && (
          <g>
            <path d="M45.8,43.6 Q50,49.6 54.2,43.6" fill="none" stroke="#e2b93b" strokeWidth={1.1} strokeDasharray="1.1 0.7" />
            <circle cx={50} cy={48.4} r={1.3} fill="#e2b93b" stroke={LINEA} strokeWidth={0.6} />
          </g>
        )}

        <BrazoSvg hombro={HOMBRO_IZQ} brazo={pose.izq} manga={mangaIzq} piel={piel} munequera={null} />
        <BrazoSvg hombro={HOMBRO_DER} brazo={pose.der} manga={mangaDer} piel={piel} munequera={munequera} />

        {/* cabeza grande */}
        <PeloAtras pelo={v.pelo} color={colorPelo} />
        <ellipse cx={34.6} cy={26} rx={2.8} ry={3.4} fill={piel} stroke={LINEA} strokeWidth={TRAZO} />
        <ellipse cx={65.4} cy={26} rx={2.8} ry={3.4} fill={piel} stroke={LINEA} strokeWidth={TRAZO} />
        <ellipse cx={50} cy={25} rx={15} ry={16} fill={piel} stroke={LINEA} strokeWidth={TRAZO} />
        <path d="M37,32 Q50,44 63,32 Q58,40 50,40.8 Q42,40 37,32 Z" fill="#000000" opacity={0.07} />
        <Cara cara={v.cara} vello={v.vello} colorPelo={colorPelo} />
        <PeloAdelante pelo={v.pelo} color={colorPelo} />
      </g>
    </svg>
  );
}
