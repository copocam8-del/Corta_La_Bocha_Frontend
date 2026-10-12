import { Crown, Medal, User } from 'lucide-react';
import { STATUS_COLOR, STATUS_LABEL, recognizedName } from '../game/answerStatus';
import type { RoundResult, Standing } from './types';

// Resultados de una ronda del multijugador: por categoría, qué puso cada uno, si valió y los puntos
export function MultiRoundResults({ result, me }: { result: RoundResult; me: string }) {
  return (
    <div data-testid="resultados-ronda">
      {result.incomplete && (
        <div className="notice" style={{ marginBottom: '10px' }}>
          <strong>La IA no pudo validar algunas respuestas.</strong> Las marcadas "Sin validar" no suman puntos y esta partida
          no va a contar para las estadísticas.
        </div>
      )}
      {result.categories.map((c) => (
        <div key={c.category} style={{ borderBottom: '1px solid rgba(57,255,140,0.12)', padding: '8px 0' }}>
          <div style={{
            fontFamily: "'Oswald', sans-serif", fontSize: '11px', letterSpacing: '1.5px',
            textTransform: 'uppercase', color: 'rgba(124,255,178,0.75)',
          }}>{c.category}</div>
          {c.entries.map((e) => {
            const recognized = recognizedName(e.answer, e.canonical);
            return (
              <div key={e.userId} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', padding: '5px 0' }}>
                <User size={13} color={e.userId === me ? '#39ff8c' : 'rgba(180,255,205,0.5)'} style={{ marginTop: 3, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '6px' }}>
                    <span style={{ fontSize: '11px', color: 'rgba(180,255,205,0.6)' }}>{e.userId === me ? 'Vos' : e.username}:</span>
                    <span style={{ color: '#ecfff3', fontSize: '13px', fontWeight: 500 }}>{e.answer || '—'}</span>
                    <span style={{
                      fontSize: '10px', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase',
                      color: STATUS_COLOR[e.status], border: `1px solid ${STATUS_COLOR[e.status]}`, borderRadius: '999px', padding: '0 6px',
                    }}>{STATUS_LABEL[e.status]}</span>
                  </div>
                  {recognized && (
                    <div style={{ fontSize: '11px', color: 'rgba(180,255,205,0.8)', marginTop: '2px' }}>
                      La IA reconoció: <strong>{recognized}</strong>
                    </div>
                  )}
                  {e.status !== 'empty' && e.reason && (
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>{e.reason}</div>
                  )}
                </div>
                <div style={{
                  fontFamily: "'Oswald', sans-serif", fontSize: '15px', fontWeight: 700, flexShrink: 0,
                  color: e.points > 0 ? STATUS_COLOR.valid : 'rgba(255,255,255,0.25)',
                }}>+{e.points}</div>
              </div>
            );
          })}
        </div>
      ))}
      <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginTop: '8px', lineHeight: 1.5 }}>
        20 puntos si sos el único con respuesta válida en la categoría · 10 si es válida y nadie puso lo mismo · 5 si otro puso
        lo mismo · 0 si no vale
      </p>
    </div>
  );
}

const MEDAL = ['#fbbf24', '#d1d5db', '#d97706'];

// Tabla final (o parcial) de posiciones
export function Standings({ standings, me }: { standings: Standing[]; me: string }) {
  return (
    <div data-testid="posiciones" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {standings.map((s) => (
        <div key={s.userId} className="player-row" style={{ borderColor: s.won ? 'rgba(251,191,36,0.6)' : undefined }}>
          <div className="avatar" style={{ color: MEDAL[s.position - 1] ?? '#39ff8c' }}>{s.position}</div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '14px', fontWeight: 600 }}>
              {s.userId === me ? `${s.username} (vos)` : s.username}
            </span>
            {s.won && <Crown size={13} color="#fbbf24" aria-label="Ganador" />}
            {s.position <= 3 && !s.abandoned && !s.won && <Medal size={13} color={MEDAL[s.position - 1]} />}
            {s.abandoned && <span style={{ fontSize: '10px', color: '#f87171', textTransform: 'uppercase' }}>abandonó</span>}
          </div>
          <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '15px', fontWeight: 700, color: '#39ff8c' }}>{s.points} pts</span>
        </div>
      ))}
    </div>
  );
}
