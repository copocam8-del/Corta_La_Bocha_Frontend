import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { RotateCcw, Trophy } from 'lucide-react';
import type { NewAchievement } from '../api/achievements';
import { achievementIcon } from '../profile/achievementIcons';
import AdSlot from '../ads/AdSlot';
import { BarraAbajo } from './ui/JuegoUI';

// Tarjeta de resultado común a los juegos (los puntos los calcula siempre el servidor). "Jugar otra" va fijo
// abajo, como el botón principal de todas las pantallas de los juegos: el resultado va al final de la pantalla.
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
    <>
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
        <button className="ghost-btn" onClick={() => navigate('/dashboard')}>Otros juegos</button>
        {/* Entre partidas (apagado salvo VITE_ADS_ENABLED=true) */}
        <AdSlot placement="resultado" />
      </div>
      <BarraAbajo>
        <button className="ui-boton" data-testid="jugar-otra" onClick={onJugarOtra}><RotateCcw size={18} /> Jugar otra</button>
      </BarraAbajo>
    </>
  );
}
