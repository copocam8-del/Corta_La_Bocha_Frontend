import type { ReactNode } from 'react';
import { gameName } from '../games/gameIcons';
import { colorJuego, etiquetaDia, numero, TENUE, VERDE } from './adminFormat';

// Piezas del panel de administración: tarjetas con números grandes y gráficos simples hechos con
// SVG y CSS (sin librerías). Mismo look verde oscuro que el resto de la app.

export function Tarjeta({ titulo, valor, detalle, color = VERDE }: { titulo: string; valor: ReactNode; detalle?: ReactNode; color?: string }) {
  return (
    <div className="card" data-testid="tarjeta" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
      <span className="kicker" style={{ fontSize: '10px', letterSpacing: '2px' }}>{titulo}</span>
      <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '30px', fontWeight: 700, color, lineHeight: 1.1 }}>{valor}</span>
      {detalle && <span style={{ fontSize: '11px', color: TENUE }}>{detalle}</span>}
    </div>
  );
}

export function Grilla({ children }: { children: ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>{children}</div>;
}

export function Seccion({ titulo, children, nota }: { titulo: string; children: ReactNode; nota?: ReactNode }) {
  return (
    <section className="card" style={{ padding: '16px', minWidth: 0 }}>
      <p className="section-label">{titulo}</p>
      {children}
      {nota && <p style={{ fontSize: '11px', color: TENUE, marginTop: '8px' }}>{nota}</p>}
    </section>
  );
}

export const SinDatos = ({ texto = 'Todavía no hay datos en este período.' }: { texto?: string }) => (
  <p data-testid="sin-datos" style={{ fontSize: '13px', color: TENUE }}>{texto}</p>
);

// Barras verticales por día (SVG que se estira al ancho). Con "series", cada barra se apila por juego.
export function BarrasPorDia({ dias, titulo }: {
  dias: { dia: string; total: number; partes?: Record<string, number> }[];
  titulo: string;
}) {
  if (dias.length === 0 || dias.every((d) => d.total === 0)) return <SinDatos />;
  const max = Math.max(...dias.map((d) => d.total));
  const W = 100; // unidades del viewBox por ancho (se escala con preserveAspectRatio="none")
  const H = 60;
  const ancho = W / dias.length;
  const cada = Math.max(1, Math.ceil(dias.length / 7)); // etiquetas: como mucho ~7
  return (
    <figure style={{ margin: 0 }}>
      <svg role="img" aria-label={titulo} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
        style={{ width: '100%', height: '140px', display: 'block' }}>
        <line x1="0" y1={H - 0.2} x2={W} y2={H - 0.2} stroke="rgba(57,255,140,0.3)" strokeWidth="0.4" />
        {dias.map((d, i) => {
          const x = i * ancho + ancho * 0.15;
          const w = ancho * 0.7;
          let y = H;
          const partes = d.partes ? Object.entries(d.partes) : [['total', d.total] as [string, number]];
          return (
            <g key={d.dia}>
              <title>{`${etiquetaDia(d.dia)}: ${numero(d.total)}`}</title>
              {partes.map(([k, v]) => {
                const h = (v / max) * (H - 4);
                y -= h;
                return <rect key={k} x={x} y={y} width={w} height={h} fill={d.partes ? colorJuego(k) : VERDE} opacity={0.85} />;
              })}
            </g>
          );
        })}
      </svg>
      <div style={{ display: 'flex', fontSize: '10px', color: TENUE, marginTop: '4px' }}>
        {dias.map((d, i) => (
          <span key={d.dia} style={{ flex: 1, textAlign: 'center', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {i % cada === 0 ? etiquetaDia(d.dia) : ''}
          </span>
        ))}
      </div>
      <figcaption style={{ fontSize: '11px', color: TENUE, marginTop: '4px' }}>Máximo: {numero(max)} por día</figcaption>
    </figure>
  );
}

// Barras horizontales (rankings, temas, letras): texto, barra proporcional y valor
export function BarrasHorizontales({ filas, sufijo = '', color = VERDE }: {
  filas: { id: string; texto: ReactNode; valor: number; detalle?: ReactNode }[];
  sufijo?: string;
  color?: string;
}) {
  if (filas.length === 0) return <SinDatos />;
  const max = Math.max(...filas.map((f) => f.valor), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {filas.map((f) => (
        <div key={f.id} data-fila={f.id} style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', fontSize: '12px' }}>
            <span style={{ minWidth: 0, overflowWrap: 'anywhere' }}>{f.texto}</span>
            <span style={{ fontFamily: "'Oswald', sans-serif", color, whiteSpace: 'nowrap' }}>
              {numero(f.valor)}{sufijo}
            </span>
          </div>
          <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(57,255,140,0.08)', marginTop: '3px' }}>
            <div style={{ width: `${(f.valor / max) * 100}%`, height: '100%', borderRadius: '3px', background: color }} />
          </div>
          {f.detalle && <span style={{ fontSize: '10px', color: TENUE }}>{f.detalle}</span>}
        </div>
      ))}
    </div>
  );
}

export function Leyenda({ juegos }: { juegos: string[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '11px', marginTop: '8px' }}>
      {juegos.map((g) => (
        <span key={g} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: colorJuego(g) }} /> {gameName(g)}
        </span>
      ))}
    </div>
  );
}

// Tabla simple que en el celular se desplaza adentro de su caja (nunca la pantalla entera)
export function Tabla({ columnas, filas }: { columnas: string[]; filas: ReactNode[][] }) {
  if (filas.length === 0) return <SinDatos />;
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr>
            {columnas.map((c) => (
              <th key={c} style={{ textAlign: 'left', padding: '6px', color: TENUE, fontWeight: 600, borderBottom: '1px solid rgba(57,255,140,0.2)', whiteSpace: 'nowrap' }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((f, i) => (
            <tr key={i}>
              {f.map((celda, j) => (
                <td key={j} style={{ padding: '6px', borderBottom: '1px solid rgba(57,255,140,0.08)', whiteSpace: j === 0 ? 'nowrap' : undefined }}>{celda}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
