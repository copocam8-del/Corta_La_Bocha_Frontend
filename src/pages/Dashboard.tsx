import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, LogOut, Trophy, User } from 'lucide-react';
import { getGames, getMyGameStats, type GameInfo, type GameStats } from '../api/games';
import { clearSession } from '../auth/session';
import BackButton from '../components/BackButton';
import MultiShell from '../multi/MultiShell';
import LegalFooter from '../components/LegalFooter';
import { gameIcon } from '../games/gameIcons';
import AdSlot from '../ads/AdSlot';
import { getMyProfile } from '../api/profile';
import { esAdmin } from '../api/admin';

// Pantalla de selección de juegos. El catálogo viene del servidor (GET /games): para sumar un
// juego se agrega allá y aparece acá solo.
export default function Dashboard() {
  const navigate = useNavigate();
  const [games, setGames] = useState<GameInfo[] | null>(null);
  const [stats, setStats] = useState<Record<string, GameStats>>({});
  const [error, setError] = useState(false);
  const [username] = useState(() => localStorage.getItem('username'));
  const [admin, setAdmin] = useState(false); // botón "Panel" sólo para el equipo (lo dice el backend)

  useEffect(() => {
    getGames().then(setGames).catch(() => setError(true));
    getMyGameStats()
      .then((list) => setStats(Object.fromEntries(list.map((s) => [s.game, s]))))
      .catch(() => setStats({}));
    getMyProfile().then((p) => setAdmin(esAdmin(p))).catch(() => setAdmin(false));
  }, []);

  // Los juegos con multijugador abren su menú (Solo / Con amigos / Online); el desafío del día va directo
  const abrir = (g: GameInfo) => navigate(g.multiplayer ? `/juego/${g.id}` : g.path);

  return (
    <MultiShell maxWidth={640}>
      {/* En el Dashboard no hay "Volver": en su lugar, cerrar sesión */}
      <BackButton to="/login" label="Cerrar sesión" icon={<LogOut size={15} strokeWidth={2.2} />} onLeave={clearSession} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div>
          <p className="kicker">Corta La Bocha</p>
          <h1 className="neon-title" style={{ fontSize: '26px', marginTop: '4px' }}>
            {username ? `¡Hola, ${username}!` : 'Elegí un juego'}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <PanelButton visible={admin} onClick={() => navigate('/admin')} />
          <button className="option-btn" style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            onClick={() => navigate('/ranking', { state: { from: '/dashboard' } })} aria-label="Ranking" data-testid="ir-ranking">
            <Trophy size={14} /> Ranking
          </button>
          <button className="option-btn" style={{ flex: 'none' }} onClick={() => navigate('/profile')} aria-label="Mi perfil">
            <User size={14} />
          </button>
        </div>
      </div>

      {error && <div className="error">No se pudieron cargar los juegos. Revisá tu conexión y probá de nuevo.</div>}
      {!games && !error && <div className="card" style={{ textAlign: 'center' }}><div className="spinner" /></div>}

      <div data-testid="juegos" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
        {games?.map((g) => {
          const Icon = gameIcon(g.id);
          const s = stats[g.id];
          return (
            <button
              key={g.id}
              data-juego={g.id}
              className="card"
              disabled={!g.available}
              onClick={() => abrir(g)}
              style={{
                textAlign: 'left', cursor: g.available ? 'pointer' : 'default', color: '#eafff2',
                display: 'flex', flexDirection: 'column', gap: '8px', opacity: g.available ? 1 : 0.55,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="avatar"><Icon size={18} /></div>
                <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '17px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {g.name}
                </span>
              </div>
              <span style={{ fontSize: '12px', color: 'rgba(180,255,205,0.7)', lineHeight: 1.45 }}>{g.description}</span>
              <span style={{ fontSize: '11px', color: g.available ? '#39ff8c' : '#fbbf24', fontFamily: "'Oswald', sans-serif", letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                {g.available
                  ? s
                    ? `${s.matchesPlayed} ${s.matchesPlayed === 1 ? 'jugada' : 'jugadas'} · ${s.totalPoints} pts · mejor racha ${s.bestStreak}`
                    : '¡Jugá tu primera!'
                  : 'Próximamente'}
              </span>
            </button>
          );
        })}
      </div>
      <AdSlot placement="seleccion-juegos" />
      <LegalFooter />
    </MultiShell>
  );
}

// Botón "Panel" (administración): sólo para admins
export function PanelButton({ visible, onClick }: { visible: boolean; onClick: () => void }) {
  if (!visible) return null;
  return (
    <button className="option-btn" style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
      onClick={onClick} aria-label="Panel de administración" data-testid="ir-panel">
      <BarChart3 size={14} /> Panel
    </button>
  );
}
