import type { PreguntaTrivia } from '../api/trivia';

// Pregunta con 4 opciones (la usan la trivia y el desafío del día). "revelada" muestra cuál era la
// correcta y cuál elegiste, después de que corrige el servidor.
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span className="kicker">{pregunta.categoria}</span>
        <span data-testid="reloj-pregunta" style={{ fontFamily: "'Oswald', sans-serif", fontSize: '22px', fontWeight: 700, color }}>{segundosRestantes}</span>
      </div>
      <div style={{ height: '3px', background: 'rgba(57,255,140,0.1)', borderRadius: '2px', overflow: 'hidden', marginBottom: '14px' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, transition: 'width 0.25s linear' }} />
      </div>
      <p style={{ fontSize: '17px', fontWeight: 600, lineHeight: 1.4, marginBottom: '14px' }}>{pregunta.texto}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {pregunta.opciones.map((o, i) => {
          const esCorrecta = revelada?.correcta === i;
          const esMiError = revelada && elegida === i && !esCorrecta;
          return (
            <button key={i} data-opcion={i} disabled={bloqueada} onClick={() => onElegir(i)}
              style={{
                textAlign: 'left', padding: '12px 14px', borderRadius: '10px', cursor: bloqueada ? 'default' : 'pointer',
                fontSize: '14px', minHeight: '48px', color: '#eafff2',
                border: `1px solid ${esCorrecta ? '#39ff8c' : esMiError ? '#ef4444' : elegida === i ? 'rgba(57,255,140,0.6)' : 'rgba(57,255,140,0.2)'}`,
                background: esCorrecta ? 'rgba(57,255,140,0.18)' : esMiError ? 'rgba(239,68,68,0.15)' : 'rgba(4,20,11,0.7)',
              }}>
              <strong style={{ fontFamily: "'Oswald', sans-serif", color: '#7CFFB2', marginRight: '8px' }}>{'ABCD'[i]}</strong>{o}
            </button>
          );
        })}
      </div>
    </div>
  );
}
