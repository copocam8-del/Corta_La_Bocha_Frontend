import { useId } from 'react';
import { varianteDe, type Hincha } from './hinchas';

// El hincha: personaje PROPIO en caricatura, de cuerpo entero, con piluso, camiseta, short, medias y
// zapatillas, festejando sobre un fondo liso. Es un solo dibujo armado en código que cambia de
// colores y diseño de camiseta según el club (hinchas.ts), con 4 poses, 3 caras y 4 tonos de piel.
// Nada de texto, escudos, logos ni marcas: sólo formas y colores.
//
// Se dibuja en un cuadrado de 100×100 pensado para verse recortado en círculo (el avatar es redondo):
// el personaje queda dentro del círculo, aun con los brazos arriba y los pies.

const LINEA = '#1d1d1f';
const PIELES = ['#f3c9a0', '#e0a877', '#b67a4f', '#7f5134'];
const BOCA = '#6b1a1a';

type Punto = [number, number];

// Brazos de cada pose: hombro → codo → mano
const HOMBRO_IZQ: Punto = [40.5, 41];
const HOMBRO_DER: Punto = [59.5, 41];
const POSES: { izq: [Punto, Punto]; der: [Punto, Punto]; bufanda?: boolean }[] = [
  { izq: [[33, 32], [31, 21]], der: [[67, 32], [69, 21]] }, // los dos brazos arriba
  { izq: [[33, 32], [31, 21]], der: [[66.5, 49], [61.5, 56]] }, // puño arriba y mano en la cintura
  { izq: [[31, 39.5], [22.5, 33]], der: [[69, 39.5], [77.5, 33]] }, // brazos abiertos
  { izq: [[34, 31], [33, 20.5]], der: [[66, 31], [67, 20.5]], bufanda: true }, // bufanda arriba
];

// Encuadre: de cuerpo entero (perfil, selector) o, si es chiquito (ranking, salas), de la cintura
// para arriba para que se distingan el piluso, la cara y la camiseta.
export const CHICO = 48;
const VISTA_GRANDE = '4 6 92 92';
const VISTA_CHICA = '24 7 52 52';

const BUFANDA = 'M31,18.2 Q50,14.5 69,18.2 L69,23.4 Q50,19.7 31,23.4 Z';
const TORSO = 'M39,39.5 Q50,35.5 61,39.5 L61.5,60 Q50,62 38.5,60 Z';

function Brazo({ hombro, codo, mano, manga, piel }: { hombro: Punto; codo: Punto; mano: Punto; manga: string; piel: string }) {
  // La manga cubre la mitad del brazo de arriba; el resto es piel
  const medio: Punto = [hombro[0] + (codo[0] - hombro[0]) * 0.55, hombro[1] + (codo[1] - hombro[1]) * 0.55];
  const antebrazo = `M${medio[0]},${medio[1]} L${codo[0]},${codo[1]} L${mano[0]},${mano[1]}`;
  const mangaD = `M${hombro[0]},${hombro[1]} L${medio[0]},${medio[1]}`;
  return (
    <g strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d={antebrazo} stroke={LINEA} strokeWidth={6.6} />
      <path d={antebrazo} stroke={piel} strokeWidth={4.6} />
      <path d={mangaD} stroke={LINEA} strokeWidth={8.8} />
      <path d={mangaD} stroke={manga} strokeWidth={6.8} />
      <circle cx={mano[0]} cy={mano[1]} r={3.3} fill={piel} stroke={LINEA} strokeWidth={1.1} />
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
        <rect key={k} x={37 + k * 5.2} y={34} width={5.3} height={30} fill={colores[k % colores.length]} />
      ));
      break;
    case 'aros':
      dibujo = Array.from({ length: 6 }, (_, k) => (
        <rect key={k} x={36} y={34 + k * 4.8} width={28} height={4.9} fill={colores[k % colores.length]} />
      ));
      break;
    case 'franja':
      dibujo = (
        <>
          <rect x={36} y={34} width={28} height={30} fill={p} />
          <rect x={36} y={45.5} width={28} height={6.5} fill={s} />
        </>
      );
      break;
    case 'banda':
      dibujo = (
        <>
          <rect x={36} y={34} width={28} height={30} fill={p} />
          <polygon points="35,43 42,34.5 66,58 59,65" fill={s} />
        </>
      );
      break;
    case 'mitades':
      dibujo = (
        <>
          <rect x={36} y={34} width={14} height={30} fill={p} />
          <rect x={50} y={34} width={14} height={30} fill={s} />
        </>
      );
      break;
    case 'v':
      dibujo = (
        <>
          <rect x={36} y={34} width={28} height={30} fill={p} />
          <polyline points="38.5,36.5 50,51 61.5,36.5" fill="none" stroke={s} strokeWidth={4.6} strokeLinejoin="miter" />
        </>
      );
      break;
    default:
      dibujo = <rect x={36} y={34} width={28} height={30} fill={p} />;
  }
  // Cuello en el color secundario
  const cuello = s;
  return (
    <g>
      <clipPath id={clip}>
        <path d={TORSO} />
      </clipPath>
      <g clipPath={`url(#${clip})`}>{dibujo}</g>
      <path d="M45,37.4 Q50,41.2 55,37.4" fill="none" stroke={cuello} strokeWidth={2} strokeLinecap="round" />
      <path d={TORSO} fill="none" stroke={LINEA} strokeWidth={1.2} strokeLinejoin="round" />
    </g>
  );
}

function Cara({ cara }: { cara: number }) {
  const ojo = (cx: number) => <circle cx={cx} cy={27.4} r={1.25} fill={LINEA} />;
  const ojoFeliz = (cx: number) => <path d={`M${cx - 1.6},28 Q${cx},26 ${cx + 1.6},28`} fill="none" stroke={LINEA} strokeWidth={1.1} strokeLinecap="round" />;
  return (
    <g>
      {cara === 0 && (
        <>
          {ojo(46.6)}
          {ojo(53.4)}
          {/* sonrisa grande, con la boca abierta */}
          <path d="M45.4,30.6 Q50,36.6 54.6,30.6 Z" fill={BOCA} stroke={LINEA} strokeWidth={0.9} strokeLinejoin="round" />
          <path d="M47.6,33.2 Q50,34.6 52.4,33.2 Q50,32.4 47.6,33.2 Z" fill="#e25b5b" />
        </>
      )}
      {cara === 1 && (
        <>
          {ojoFeliz(46.6)}
          {ojoFeliz(53.4)}
          {/* gritando el gol */}
          <ellipse cx={50} cy={32.4} rx={2.9} ry={2.7} fill={BOCA} stroke={LINEA} strokeWidth={0.9} />
          <ellipse cx={50} cy={33.6} rx={1.7} ry={1} fill="#e25b5b" />
        </>
      )}
      {cara === 2 && (
        <>
          {ojoFeliz(46.6)}
          {ojo(53.4)}
          {/* guiño y sonrisa */}
          <path d="M45.6,31 Q50,35 54.4,31" fill="none" stroke={LINEA} strokeWidth={1.2} strokeLinecap="round" />
        </>
      )}
      <circle cx={44.4} cy={30.6} r={1.5} fill="#ff7f7f" opacity={0.45} />
      <circle cx={55.6} cy={30.6} r={1.5} fill="#ff7f7f" opacity={0.45} />
    </g>
  );
}

export default function HinchaSvg({ hincha, size = 84 }: { hincha: Hincha; size?: number }) {
  const clip = `torso-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const { pose: nPose, cara, piel: nPiel } = varianteDe(hincha.id);
  const pose = POSES[nPose];
  const piel = PIELES[nPiel];
  const [p, s] = hincha.camiseta;
  const mangaIzq = p;
  const mangaDer = hincha.diseno === 'mitades' ? s : p;
  const cinta = hincha.piluso.toLowerCase() === s.toLowerCase() ? p : s; // cinta del piluso
  return (
    <svg viewBox={size < CHICO ? VISTA_CHICA : VISTA_GRANDE} width={size} height={size} aria-hidden="true" focusable="false" style={{ display: 'block' }}>
      <rect width={100} height={100} fill={hincha.fondo} />

      {/* marquitas de festejo */}
      <g stroke="#ffffff" strokeWidth={1.3} strokeLinecap="round" opacity={0.75}>
        <path d="M17,22 L13,19.5" />
        <path d="M16.5,28 L12,28" />
        <path d="M83,22 L87,19.5" />
        <path d="M83.5,28 L88,28" />
      </g>

      {/* piernas, medias y zapatillas */}
      <g stroke={LINEA} strokeWidth={1.1} strokeLinejoin="round">
        <rect x={41.2} y={67} width={5.4} height={13} fill={piel} />
        <rect x={53.4} y={67} width={5.4} height={13} fill={piel} />
        <rect x={40.9} y={78} width={6} height={10} rx={1} fill={hincha.medias} />
        <rect x={53.1} y={78} width={6} height={10} rx={1} fill={hincha.medias} />
        <path d="M38.6,87.6 h8.6 v3.3 q0,1.8 -1.8,1.8 h-8.6 q-1.7,0 -1.4,-1.7 q0.5,-2.6 3.2,-3.4 z" fill="#ffffff" />
        <path d="M52.8,87.6 h8.6 q2.7,0.8 3.2,3.4 q0.3,1.7 -1.4,1.7 h-8.6 q-1.8,0 -1.8,-1.8 z" fill="#ffffff" />
      </g>
      <path d="M36,91.4 h10.5 M53.6,91.4 h10.5" stroke="#9aa0a6" strokeWidth={1} />

      {/* short */}
      <path d="M39,57.5 L61,57.5 L62.6,70 L52.2,70 L50,64.5 L47.8,70 L37.4,70 Z" fill={hincha.short} stroke={LINEA} strokeWidth={1.1} strokeLinejoin="round" />

      {/* camiseta */}
      <Camiseta hincha={hincha} clip={clip} />

      {/* bufanda con los colores del club (sin letras) */}
      {pose.bufanda && (
        <g>
          <clipPath id={`${clip}-bufanda`}>
            <path d={BUFANDA} />
          </clipPath>
          <g clipPath={`url(#${clip}-bufanda)`}>
            {Array.from({ length: 6 }, (_, k) => (
              <rect key={k} x={31 + k * 6.34} y={12} width={6.4} height={14} fill={k % 2 === 0 ? p : s} />
            ))}
          </g>
          <path d={BUFANDA} fill="none" stroke={LINEA} strokeWidth={1} strokeLinejoin="round" />
        </g>
      )}

      {/* brazos */}
      <Brazo hombro={HOMBRO_IZQ} codo={pose.izq[0]} mano={pose.izq[1]} manga={mangaIzq} piel={piel} />
      <Brazo hombro={HOMBRO_DER} codo={pose.der[0]} mano={pose.der[1]} manga={mangaDer} piel={piel} />

      {/* cuello, cabeza y orejas */}
      <rect x={47.3} y={33.4} width={5.4} height={4.4} fill={piel} />
      <circle cx={41.8} cy={28.2} r={1.9} fill={piel} stroke={LINEA} strokeWidth={1} />
      <circle cx={58.2} cy={28.2} r={1.9} fill={piel} stroke={LINEA} strokeWidth={1} />
      <circle cx={50} cy={27.2} r={8.6} fill={piel} stroke={LINEA} strokeWidth={1.1} />
      <Cara cara={cara} />

      {/* piluso (gorro tipo pescador) */}
      <g stroke={LINEA} strokeWidth={1.1} strokeLinejoin="round">
        <ellipse cx={50} cy={23.6} rx={13} ry={3} fill={hincha.piluso} />
        <path d="M41.4,23.4 Q41.6,13.4 50,12.8 Q58.4,13.4 58.6,23.4 Q50,22 41.4,23.4 Z" fill={hincha.piluso} />
        <path d="M41.5,20.6 Q50,19.2 58.5,20.6 L58.6,23.2 Q50,21.9 41.4,23.2 Z" fill={cinta} strokeWidth={0.8} />
      </g>
    </svg>
  );
}
