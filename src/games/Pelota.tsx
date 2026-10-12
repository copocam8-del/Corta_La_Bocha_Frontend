import { etapaPelota } from './pelotaEtapas';

// "La redonda": en vez del muñeco del ahorcado, una pelota que se va desinflando con cada error.

export default function Pelota({ errores, max }: { errores: number; max: number }) {
  const e = etapaPelota(errores, max);
  const cx = 100;
  const suelo = 175;
  const r = 62;
  return (
    <svg viewBox="0 0 200 200" width="180" height="180" role="img" aria-label={`Pelota: ${errores} de ${max} errores`} data-testid="pelota">
      {/* sombra */}
      <ellipse cx={cx} cy={suelo + 4} rx={r * e.scaleX * 0.9} ry={6} fill="rgba(0,0,0,0.35)" />
      <g
        style={{ transition: 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1)' }}
        // Se aplasta contra el piso: el punto de apoyo (cx, suelo) queda fijo
        transform={`translate(${cx} ${suelo}) scale(${e.scaleX} ${e.scaleY}) translate(${-cx} ${-suelo})`}
      >
        <circle cx={cx} cy={suelo - r} r={r} fill={e.color} stroke="#0b2b18" strokeWidth={3} />
        {/* gajos de la pelota (pentágono central y costuras) */}
        <g fill="#101a14" opacity={0.25 + 0.65 * e.brillo}>
          <polygon points={`${cx},${suelo - r - 22} ${cx + 21},${suelo - r - 7} ${cx + 13},${suelo - r + 18} ${cx - 13},${suelo - r + 18} ${cx - 21},${suelo - r - 7}`} />
          <polygon points={`${cx - 58},${suelo - r - 12} ${cx - 44},${suelo - r - 30} ${cx - 34},${suelo - r - 10} ${cx - 46},${suelo - r + 8}`} />
          <polygon points={`${cx + 58},${suelo - r - 12} ${cx + 44},${suelo - r - 30} ${cx + 34},${suelo - r - 10} ${cx + 46},${suelo - r + 8}`} />
          <polygon points={`${cx - 22},${suelo - 8} ${cx - 8},${suelo - 22} ${cx + 8},${suelo - 22} ${cx + 22},${suelo - 8}`} />
        </g>
        <g stroke="#101a14" strokeWidth={2} opacity={0.35 * e.brillo + 0.1} fill="none">
          <line x1={cx} y1={suelo - r - 22} x2={cx} y2={suelo - r * 2 + 2} />
          <line x1={cx + 21} y1={suelo - r - 7} x2={cx + 34} y2={suelo - r - 10} />
          <line x1={cx - 21} y1={suelo - r - 7} x2={cx - 34} y2={suelo - r - 10} />
          <line x1={cx + 13} y1={suelo - r + 18} x2={cx + 8} y2={suelo - 22} />
          <line x1={cx - 13} y1={suelo - r + 18} x2={cx - 8} y2={suelo - 22} />
        </g>
        {/* brillo */}
        <ellipse cx={cx - 22} cy={suelo - r - 30} rx={14} ry={8} fill="#fff" opacity={0.45 * e.brillo} />
      </g>
      {/* aire que se escapa */}
      {errores > 0 && !e.muerta && (
        <g stroke="rgba(180,255,205,0.7)" strokeWidth={2} strokeLinecap="round" fill="none">
          <path d="M160 70 q10 -6 20 0" />
          <path d="M162 84 q12 -5 24 0" opacity={errores > 2 ? 1 : 0} />
          <path d="M160 98 q10 -6 20 0" opacity={errores > 4 ? 1 : 0} />
        </g>
      )}
    </svg>
  );
}
