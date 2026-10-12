import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, Trophy } from 'lucide-react';
import type { NewAchievement } from '../api/achievements';
import { achievementIcon } from '../profile/achievementIcons';

// Tarjeta de resultado común a los juegos (los puntos los calcula siempre el servidor)
export default function GameResult({
  titulo,
  gano,
  puntos,
  logros = [],
  onJugarOtra,
  children,
}: {
  titulo: string;
  gano: boolean;
  puntos: number;
  logros?: NewAchievement[];
  onJugarOtra: () => void;
  children?: ReactNode;
}) {
  const navigate = useNavigate();
  return (
    <div className="card pulse" style={{ textAlign: 'center' }} data-testid="resultado-juego">
      <Trophy size={26} color={gano ? '#fbbf24' : 'rgba(255,255,255,0.35)'} />
      <h2 className="neon-title" style={{ fontSize: '24px', margin: '6px 0' }}>{titulo}</h2>
      {children}
      <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: '40px', fontWeight: 700, color: '#39ff8c', margin: '8px 0' }} data-testid="puntos">
        +{puntos} <span style={{ fontSize: '16px' }}>pts</span>
      </p>
      {logros.length > 0 && (
        <div role="status" style={{
          margin: '6px 0 12px', padding: '10px 12px', borderRadius: '10px',
          background: 'rgba(250,204,21,0.1)', border: '1px solid rgba(250,204,21,0.45)',
        }}>
          <p className="kicker" style={{ color: '#fde047' }}>{logros.length === 1 ? '¡Logro desbloqueado!' : '¡Logros desbloqueados!'}</p>
          {logros.map((a) => {
            const Icon = achievementIcon(a.id);
            return (
              <p key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px', color: '#fef9c3', marginTop: '4px' }}>
                <Icon size={15} color="#fde047" /> <strong>{a.name}</strong> · {a.description}
              </p>
            );
          })}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button className="main-btn" onClick={onJugarOtra}><RotateCcw size={16} /> Jugar otra</button>
        <button className="ghost-btn" onClick={() => navigate('/dashboard')}>Otros juegos</button>
      </div>
    </div>
  );
}
