import { Lock } from 'lucide-react';
import type { Achievement } from '../api/achievements';
import { achievementIcon } from './achievementIcons';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });

// Grilla de logros del perfil: los desbloqueados a color, los bloqueados en gris con un candado
export default function AchievementsGrid({ achievements }: { achievements: Achievement[] }) {
  return (
    <ul style={{
      listStyle: 'none', margin: 0, padding: 0,
      display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px',
    }}>
      {achievements.map((a) => {
        const Icon = achievementIcon(a.id);
        return (
          <li
            key={a.id}
            title={a.unlocked && a.unlockedAt ? `${a.description} Desbloqueado el ${formatDate(a.unlockedAt)}.` : a.description}
            aria-label={`${a.name}: ${a.description} ${a.unlocked ? 'Desbloqueado.' : 'Bloqueado.'}`}
            style={{
              position: 'relative',
              border: `1px solid ${a.unlocked ? 'rgba(250,204,21,0.45)' : 'rgba(255,255,255,0.08)'}`,
              background: a.unlocked ? 'rgba(250,204,21,0.08)' : 'rgba(255,255,255,0.02)',
              borderRadius: '10px', padding: '10px 8px', textAlign: 'center',
              filter: a.unlocked ? 'none' : 'grayscale(1)',
              opacity: a.unlocked ? 1 : 0.5,
            }}
          >
            {!a.unlocked && (
              <Lock size={11} color="rgba(255,255,255,0.5)" style={{ position: 'absolute', top: 6, right: 6 }} aria-hidden="true" />
            )}
            <Icon size={22} strokeWidth={1.8} color={a.unlocked ? '#fde047' : 'rgba(255,255,255,0.6)'} />
            <p style={{
              fontFamily: "'Oswald', sans-serif", fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px',
              color: a.unlocked ? '#fef9c3' : 'rgba(255,255,255,0.7)', margin: '6px 0 2px',
            }}>{a.name}</p>
            <p style={{ fontSize: '10px', lineHeight: 1.35, color: 'rgba(200,255,220,0.6)', margin: 0 }}>{a.description}</p>
          </li>
        );
      })}
    </ul>
  );
}
