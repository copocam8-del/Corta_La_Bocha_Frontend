import { Bot, User } from 'lucide-react';
import type { CategoryResult } from '../api/soloMatch';
import { STATUS_COLOR, STATUS_LABEL, recognizedName, type AnswerStatus } from './answerStatus';

interface RowProps {
  who: 'vos' | 'maquina';
  answer: string | null;
  status: AnswerStatus;
  canonical: string | null;
  reason: string;
  points: number;
}

function AnswerRow({ who, answer, status, canonical, reason, points }: RowProps) {
  const recognized = recognizedName(answer, canonical);
  const Icon = who === 'vos' ? User : Bot;
  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '6px 0' }}>
      <Icon size={14} color={who === 'vos' ? '#39ff8c' : '#ef4444'} style={{ marginTop: 2, flexShrink: 0 }} aria-label={who === 'vos' ? 'Vos' : 'Máquina'} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ color: '#ecfff3', fontSize: '13px', fontWeight: 500 }}>{answer || '—'}</span>
          <span style={{
            fontSize: '10px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase',
            color: STATUS_COLOR[status], border: `1px solid ${STATUS_COLOR[status]}`, borderRadius: '999px', padding: '0 6px',
          }}>{STATUS_LABEL[status]}</span>
        </div>
        {recognized && (
          <div style={{ fontSize: '11px', color: 'rgba(180,255,205,0.8)', marginTop: '2px' }}>
            La IA reconoció: <strong>{recognized}</strong>
          </div>
        )}
        {status !== 'empty' && reason && (
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>{reason}</div>
        )}
      </div>
      <div style={{
        fontFamily: "'Oswald', sans-serif", fontSize: '15px', fontWeight: 700, flexShrink: 0,
        color: points > 0 ? STATUS_COLOR.valid : 'rgba(255,255,255,0.25)',
      }}>+{points}</div>
    </div>
  );
}

// Detalle de la ronda: por cada categoría, tu respuesta y la de la máquina
export default function RoundResults({ results }: { results: CategoryResult[] }) {
  return (
    <div>
      {results.map((r) => (
        <div key={r.category} style={{ borderBottom: '1px solid rgba(57,255,140,0.12)', padding: '8px 0' }}>
          <div style={{
            fontFamily: "'Oswald', sans-serif", fontSize: '11px', letterSpacing: '1.5px',
            textTransform: 'uppercase', color: 'rgba(124,255,178,0.75)',
          }}>{r.category}</div>
          <AnswerRow who="vos" answer={r.userAnswer} status={r.status} canonical={r.canonical} reason={r.reason} points={r.points} />
          <AnswerRow
            who="maquina"
            answer={r.machine.answer}
            status={r.machine.status}
            canonical={r.machine.canonical}
            reason={r.machine.reason}
            points={r.machine.points}
          />
        </div>
      ))}
      <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginTop: '8px', lineHeight: 1.5 }}>
        20 puntos si sos el único con respuesta válida en la categoría · 10 si es válida y distinta · 5 si coincide con la de la máquina
      </p>
    </div>
  );
}
