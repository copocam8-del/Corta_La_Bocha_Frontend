import type { PreguntaTrivia } from '../api/trivia';

// Pregunta con 4 opciones (la usan la trivia y el desafío del día). "revelada" muestra cuál era la
// correcta y cuál elegiste, después de que corrige el servidor. Las opciones son filas como las de los
// ajustes (games/ui): la letra en un circulito y el texto.

const CSS_PREGUNTA = `
  .qc-opcion { display: flex; align-items: center; gap: 12px; width: 100%; min-height: 56px; padding: 9px 14px; border-radius: 10px;
    text-align: left; font-family: 'Inter', sans-serif; font-size: 15px; line-height: 1.35; color: #eafff2; cursor: pointer;
    background: rgba(10,30,18,0.5); border: 1px solid rgba(57,255,140,0.22); transition: border-color 0.2s, background 0.2s, box-shadow 0.2s; }
  .qc-opcion:disabled { cursor: default; }
  .qc-opcion:focus-visible { outline: 2px solid #39ff8c; outline-offset: 2px; }
  .qc-opcion .ui-fila-icono { width: 34px; height: 34px; font-size: 15px; }
  .qc-opcion.elegida { border-color: rgba(57,255,140,0.6); background: rgba(57,255,140,0.08); }
  .qc-opcion.correcta { border-color: #39ff8c; background: rgba(57,255,140,0.18); box-shadow: 0 0 16px rgba(57,255,140,0.3); }
  .qc-opcion.error { border-color: #ef4444; background: rgba(239,68,68,0.15); }
  .qc-opcion.error .ui-fila-icono { color: #fca5a5; border-color: rgba(239,68,68,0.6); background: rgba(239,68,68,0.12); box-shadow: none; }
  @media (hover: hover) { .qc-opcion:hover:not(:disabled) { border-color: #39ff8c; background: rgba(57,255,140,0.08); } }
`;

export default function QuestionCard({
  pregunta,
  segundosRestantes,
  elegida,
  revelada,
  bloqueada,
  onElegir,
}: {
  pregunta: PreguntaTrivia;
  segundosRestantes: number;
  elegida: number | null;
  revelada: { correcta: number } | null;
  bloqueada: boolean;
  onElegir: (i: number) => void;
}) {
  const pct = (segundosRestantes / pregunta.segundos) * 100;
  const color = segundosRestantes > 10 ? '#39ff8c' : segundosRestantes > 5 ? '#fbbf24' : '#ef4444';
  return (
    <div className="card" data-testid="pregunta">
      <style>{CSS_PREGUNTA}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span className="kicker">{pregunta.categoria}</span>
        <span data-testid="reloj-pregunta" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '26px', fontWeight: 700, color, textShadow: `0 0 14px ${color}` }}>{segundosRestantes}</span>
      </div>
      <div style={{ height: '4px', background: 'rgba(57,255,140,0.1)', borderRadius: '2px', overflow: 'hidden', marginBottom: '16px' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}`, transition: 'width 0.25s linear' }} />
      </div>
      <p style={{ fontSize: '19px', fontWeight: 600, lineHeight: 1.4, marginBottom: '16px' }}>{pregunta.texto}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {pregunta.opciones.map((o, i) => {
          const esCorrecta = revelada?.correcta === i;
          const esMiError = revelada && elegida === i && !esCorrecta;
          const clase = esCorrecta ? ' correcta' : esMiError ? ' error' : elegida === i ? ' elegida' : '';
          return (
            <button key={i} type="button" data-opcion={i} disabled={bloqueada} onClick={() => onElegir(i)} className={`qc-opcion${clase}`}>
              <span className="ui-fila-icono">{'ABCD'[i]}</span>
              <span style={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>{o}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
