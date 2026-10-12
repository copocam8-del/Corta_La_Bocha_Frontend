import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Trophy, Medal, Shield, Star } from 'lucide-react';
import BackButton from '../components/BackButton';
import { getMyRanking, getRanking, winRate, type MyRanking, type RankingPeriod, type RankingRow } from '../api/profile';
import { getTokenUserId } from '../auth/session';
import { getGames, type GameInfo } from '../api/games';

interface RankingPlayer {
  id: number; // posición
  userId: string;
  name: string;
  points: number;
  matches: number;
  winRate: string;
}

// Adapta lo que devuelve GET /users/ranking a lo que dibuja esta pantalla. En la pestaña ELO,
// "points" es el ELO.
const toPlayer = (period: RankingPeriod) => (r: RankingRow): RankingPlayer => ({
  id: r.position,
  userId: r.userId,
  name: r.username,
  points: period === 'elo' ? r.elo : r.totalPoints,
  matches: r.matchesPlayed,
  winRate: `${winRate(r.matchesPlayed, r.matchesWon)}%`,
});

const TABS: { id: RankingPeriod; label: string; desc: string }[] = [
  { id: 'global', label: 'Global', desc: 'Puntos de todas tus partidas' },
  { id: 'semanal', label: 'Semanal', desc: 'Puntos desde el lunes (hora argentina)' },
  { id: 'mensual', label: 'Mensual', desc: 'Puntos desde el día 1 del mes (hora argentina)' },
  { id: 'elo', label: 'ELO', desc: 'Sube si le ganás a rivales fuertes, baja si perdés con débiles' },
];

export default function GlobalRanking() {
  // Pantalla anterior lógica: el perfil si viniste de ahí; si no, el Dashboard
  const from = (useLocation().state as { from?: string } | null)?.from === '/profile' ? '/profile' : '/dashboard';
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 80);
    return () => clearTimeout(t);
  }, []);

  const sparks = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 2 + Math.random() * 3,
        duration: 5 + Math.random() * 5,
        delay: Math.random() * 6,
        dx: (Math.random() - 0.5) * 40,
      })),
    []
  );

  const [period, setPeriod] = useState<RankingPeriod>('global');
  // '' = ranking general (todos los juegos)
  const [game, setGame] = useState('');
  const [games, setGames] = useState<GameInfo[]>([]);
  useEffect(() => { getGames().then(gs => setGames(gs.filter(g => g.available))).catch(() => setGames([])); }, []);
  const [ranking, setRanking] = useState<RankingPlayer[] | null>(null);
  const [mine, setMine] = useState<MyRanking | null>(null);
  const [rankingError, setRankingError] = useState(false);
  const myUserId = useMemo(() => getTokenUserId(), []);
  const unit = period === 'elo' ? 'ELO' : 'pts';

  const changePeriod = (p: RankingPeriod) => {
    if (p === period) return;
    setPeriod(p);
    setRanking(null);
    setMine(null);
    setRankingError(false);
  };

  const changeGame = (g: string) => {
    if (g === game) return;
    setGame(g);
    setRanking(null);
    setMine(null);
    setRankingError(false);
  };

  useEffect(() => {
    let alive = true;
    const g = period === 'elo' ? undefined : game || undefined;
    Promise.all([getRanking(period, g), getMyRanking(period, g)])
      .then(([rows, me]) => {
        if (!alive) return;
        setRanking(rows.map(toPlayer(period)));
        setMine(me);
      })
      .catch(() => alive && setRankingError(true));
    return () => { alive = false; };
  }, [period, game]);

  const podio = (ranking ?? []).slice(0, 3);
  const restoDelTop = (ranking ?? []).slice(3);

  const getMedalColor = (pos: number) => {
    if (pos === 1) return '#fbbf24'; 
    if (pos === 2) return '#cbd5e1'; 
    return '#b45309'; 
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes kenBurns {
          0%   { transform: scale(1) translate(0,0); }
          100% { transform: scale(1.05) translate(-1%,-1%); }
        }
        @keyframes lineGlow {
          0%, 100% { opacity: 0.25; }
          50%      { opacity: 0.55; }
        }
        @keyframes neonPulse {
          0%, 100% {
            box-shadow: 0 0 18px rgba(57,255,140,0.15), 0 0 40px rgba(57,255,140,0.05);
            border-color: rgba(57,255,140,0.2);
          }
          50% {
            box-shadow: 0 0 25px rgba(57,255,140,0.35), 0 0 50px rgba(57,255,140,0.15);
            border-color: rgba(57,255,140,0.5);
          }
        }
        @keyframes riseIn {
          0%   { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes drift {
          0%   { transform: translate(0,0); opacity: 0; }
          15%  { opacity: 0.8; }
          100% { transform: translate(var(--dx),-160px); opacity: 0; }
        }
        @keyframes podioPop {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        .ranking-card { animation: neonPulse 4s ease-in-out infinite; }
        
        .rank-row {
          display: flex; align-items: center; gap: 16px;
          padding: 12px 18px; border-radius: 10px;
          background: rgba(57,255,140,0.02);
          border: 1px solid rgba(57,255,140,0.08);
          transition: all 0.2s ease;
        }
        .rank-row:hover {
          background: rgba(57,255,140,0.05);
          border-color: rgba(57,255,140,0.25);
          transform: translateX(4px);
        }
        .rank-row.me {
          background: rgba(57,255,140,0.08);
          border-color: rgba(57,255,140,0.4);
        }

        .back-btn {
          background: rgba(4,20,11,0.6);
          border: 1px solid rgba(57,255,140,0.2);
          color: #7CFFB2; border-radius: 8px;
          padding: 8px 14px; cursor: pointer;
          font-family: 'Oswald', sans-serif; font-size: 11px;
          letter-spacing: 2px; text-transform: uppercase;
          display: flex; align-items: center; gap: 6px;
          transition: all 0.2s ease;
        }
        .back-btn:hover {
          background: rgba(57,255,140,0.1);
          border-color: #39ff8c; box-shadow: 0 0 12px rgba(57,255,140,0.2);
        }
      `}</style>

      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', background: '#010805' }}>
        <div style={{
          position: 'absolute', inset: '-3%',
          animation: 'kenBurns 24s ease-in-out infinite alternate',
          pointerEvents: 'none',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: `repeating-linear-gradient(115deg,#052e16 0px,#052e16 80px,#064a22 80px,#064a22 160px)`,
          }}/>
          <div style={{
            position: 'absolute', inset: 0,
            background: `
              radial-gradient(ellipse 90% 70% at 50% 0%, rgba(57,255,140,0.35) 0%, transparent 60%),
              linear-gradient(180deg, rgba(2,10,6,0.6) 0%, rgba(1,5,3,0.8) 100%)
            `,
            mixBlendMode: 'screen',
          }}/>
          <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.35, animation: 'lineGlow 5s ease-in-out infinite' }}>
            <g stroke="#7CFFB2" strokeWidth="2" fill="none">
              <rect x="80" y="60" width="1440" height="780"/>
              <line x1="800" y1="60" x2="800" y2="840"/>
              <circle cx="800" cy="450" r="130"/>
            </g>
          </svg>
        </div>

        {sparks.map(s => (
          <div key={s.id} style={{
            position: 'absolute', bottom: '20%', left: `${s.left}%`,
            width: `${s.size}px`, height: `${s.size}px`, borderRadius: '50%',
            background: 'rgba(160,255,200,0.8)', boxShadow: '0 0 6px rgba(57,255,140,0.6)',
            animation: `drift ${s.duration}s ease-out ${s.delay}s infinite`,
            '--dx': `${s.dx}px`, pointerEvents: 'none',
          } as React.CSSProperties}/>
        ))}
      </div>

      <div style={{
        position: 'relative', zIndex: 1, minHeight: '100vh',
        display: 'flex', justifyContent: 'center',
        padding: '68px 16px 24px', fontFamily: "'Inter', sans-serif", overflowY: 'auto',
      }}>
        <div style={{
          width: '100%', maxWidth: '680px',
          display: 'flex', flexDirection: 'column', gap: '20px',
          opacity: entered ? 1 : 0,
          transition: 'opacity 0.4s ease',
          animation: entered ? 'riseIn 0.5s ease both' : 'none',
        }}>
          
          <BackButton to={from} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={14} color="#39ff8c" />
              <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '11px', color: 'rgba(57,255,140,0.6)', letterSpacing: '2px', textTransform: 'uppercase' }}>
                Temporada Oficial
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'center', margin: '10px 0' }}>
            <h1 style={{
              fontFamily: "'Oswald', sans-serif", fontSize: '36px', fontWeight: 700,
              color: '#eafff2', letterSpacing: '4px', textTransform: 'uppercase',
              textShadow: '0 0 20px rgba(57,255,140,0.4)', display: 'inline-flex', alignItems: 'center', gap: '10px'
            }}>
              <Trophy size={32} color="#fbbf24" strokeWidth={2} /> RANKING
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '4px', letterSpacing: '1px' }}>
              {TABS.find(t => t.id === period)!.desc}
            </p>
          </div>

          {/* Pestañas */}
          <div role="tablist" style={{ display: 'flex', gap: '6px' }}>
            {TABS.map(t => (
              <button key={t.id} role="tab" aria-selected={period === t.id} onClick={() => changePeriod(t.id)} style={{
                flex: 1, padding: '8px 4px', borderRadius: '8px', cursor: 'pointer',
                fontFamily: "'Oswald', sans-serif", fontSize: '12px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase',
                border: `1px solid ${period === t.id ? '#39ff8c' : 'rgba(57,255,140,0.2)'}`,
                background: period === t.id ? 'rgba(57,255,140,0.12)' : 'rgba(57,255,140,0.03)',
                color: period === t.id ? '#39ff8c' : 'rgba(180,255,205,0.55)',
              }}>{t.label}</button>
            ))}
          </div>

          {/* Juego (el ELO es general) */}
          {period !== 'elo' && games.length > 1 && (
            <div data-testid="filtro-juego" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '-8px' }}>
              {[{ id: '', name: 'Todos los juegos' }, ...games].map(g => (
                <button key={g.id || 'todos'} onClick={() => changeGame(g.id)} style={{
                  padding: '5px 10px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px',
                  border: `1px solid ${game === g.id ? '#39ff8c' : 'rgba(57,255,140,0.2)'}`,
                  background: game === g.id ? 'rgba(57,255,140,0.12)' : 'transparent',
                  color: game === g.id ? '#39ff8c' : 'rgba(180,255,205,0.6)',
                }}>{g.name}</button>
              ))}
            </div>
          )}

          {/* Mi posición (aunque no esté en el top) */}
          {mine && (
            <div data-testid="mi-posicion" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px',
              padding: '10px 14px', borderRadius: '12px', background: 'rgba(57,255,140,0.06)', border: '1px solid rgba(57,255,140,0.35)',
            }}>
              <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '13px', letterSpacing: '1px', color: '#7CFFB2', textTransform: 'uppercase' }}>
                Tu posición
              </span>
              <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '15px', color: '#eafff2' }}>
                {mine.position
                  ? `${mine.position}° de ${mine.totalPlayers} · ${(period === 'elo' ? mine.elo : mine.totalPoints).toLocaleString()} ${unit}`
                  : period === 'elo'
                  ? `Sin ranking todavía (ELO ${mine.elo})`
                  : 'Todavía no jugaste en este período'}
              </span>
            </div>
          )}

          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1.1fr 1fr', gap: '12px', 
            alignItems: 'end', margin: '10px 0',
            animation: 'podioPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) both'
          }}>
            {podio[1] && (
              <div style={{
                background: 'linear-gradient(180deg, rgba(200,200,200,0.06) 0%, rgba(4,20,11,0.8) 100%)',
                border: '1px solid rgba(200,200,200,0.2)', borderRadius: '12px',
                padding: '16px 10px', textAlign: 'center', height: '140px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
              }}>
                <Medal size={24} color={getMedalColor(2)} />
                <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: '14px', color: '#eafff2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', marginTop: '6px' }}>{podio[1].name}</p>
                <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: '16px', fontWeight: 700, color: '#cbd5e1', marginTop: '2px' }}>{podio[1].points.toLocaleString()} {unit}</p>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>{podio[1].winRate} WR</span>
              </div>
            )}

            {podio[0] && (
              <div style={{
                background: 'linear-gradient(180deg, rgba(251,191,36,0.1) 0%, rgba(4,20,11,0.9) 100%)',
                border: '2px solid #fbbf24', borderRadius: '14px',
                padding: '20px 10px', textAlign: 'center', height: '165px',
                boxShadow: '0 0 25px rgba(251,191,36,0.25)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 2
              }}>
                <Trophy size={32} color={getMedalColor(1)} style={{ filter: 'drop-shadow(0 0 8px #fbbf24)' }} />
                <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: '16px', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', marginTop: '6px' }}>{podio[0].name}</p>
                <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: '20px', fontWeight: 700, color: '#fbbf24', marginTop: '2px' }}>{podio[0].points.toLocaleString()} {unit}</p>
                <span style={{ fontSize: '10px', color: 'rgba(251,191,36,0.6)', fontWeight: 600, letterSpacing: '1px' }}>{podio[0].winRate} VICTORIAS</span>
              </div>
            )}

            {podio[2] && (
              <div style={{
                background: 'linear-gradient(180deg, rgba(180,83,9,0.06) 0%, rgba(4,20,11,0.8) 100%)',
                border: '1px solid rgba(180,83,9,0.2)', borderRadius: '12px',
                padding: '16px 10px', textAlign: 'center', height: '130px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
              }}>
                <Medal size={24} color={getMedalColor(3)} />
                <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: '14px', color: '#eafff2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', marginTop: '6px' }}>{podio[2].name}</p>
                <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: '16px', fontWeight: 700, color: '#b45309', marginTop: '2px' }}>{podio[2].points.toLocaleString()} {unit}</p>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>{podio[2].winRate} WR</span>
              </div>
            )}
          </div>

          {(rankingError || !ranking || ranking.length === 0) && (
            <p role="status" style={{ textAlign: 'center', fontSize: '13px', color: rankingError ? '#fca5a5' : 'rgba(180,255,205,0.6)' }}>
              {rankingError
                ? 'No se pudo cargar el ranking. Probá de nuevo en un rato.'
                : !ranking
                ? 'Cargando ranking...'
                : 'Todavía no hay jugadores en el ranking. ¡Jugá una partida y sé el primero!'}
            </p>
          )}

          <div className="ranking-card" style={{
            background: 'rgba(4,20,11,0.75)',
            border: '1px solid rgba(57,255,140,0.2)',
            borderTop: '2px solid rgba(57,255,140,0.5)',
            borderRadius: '16px', padding: '16px',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 40px 80px -20px rgba(0,0,0,0.8)',
            display: 'flex', flexDirection: 'column', gap: '8px'
          }}>
            
            <div style={{
              display: 'flex', padding: '4px 18px',
              fontFamily: "'Oswald', sans-serif", fontSize: '10px', letterSpacing: '2px',
              color: 'rgba(124,255,178,0.4)', textTransform: 'uppercase'
            }}>
              <div style={{ width: '40px' }}>Pos</div>
              <div style={{ flex: 1 }}>DT / Entrenador</div>
              <div style={{ width: '80px', textAlign: 'center' }}>Partidas</div>
              <div style={{ width: '60px', textAlign: 'center' }}>Efect.</div>
              <div style={{ width: '100px', textAlign: 'right' }}>{period === 'elo' ? 'ELO' : 'Puntos'}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '340px', overflowY: 'auto', paddingRight: '4px' }}>
              {restoDelTop.map((player) => {
                const isMe = player.userId === myUserId;

                return (
                  <div key={player.userId} className={`rank-row${isMe ? ' me' : ''}`}>
                    <div style={{
                      fontFamily: "'Oswald', sans-serif", fontSize: '14px', fontWeight: 700,
                      color: 'rgba(124,255,178,0.6)', width: '40px'
                    }}>
                      {player.id}°
                    </div>

                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontFamily: "'Oswald', sans-serif", fontSize: '14px', fontWeight: 600,
                        color: isMe ? '#39ff8c' : '#eafff2', letterSpacing: '0.5px'
                      }}>
                        {player.name}
                      </span>
                      {isMe && (
                        <span style={{
                          fontSize: '8px', background: 'rgba(57,255,140,0.15)', color: '#39ff8c',
                          padding: '1px 5px', borderRadius: '4px', fontWeight: 600, letterSpacing: '1px'
                        }}>VOS</span>
                      )}
                    </div>

                    <div style={{
                      fontFamily: "'Oswald', sans-serif", fontSize: '13px',
                      color: 'rgba(255,255,255,0.4)', width: '80px', textAlign: 'center'
                    }}>
                      {player.matches}
                    </div>

                    <div style={{
                      fontFamily: "'Oswald', sans-serif", fontSize: '13px',
                      color: 'rgba(255,255,255,0.4)', width: '60px', textAlign: 'center'
                    }}>
                      {player.winRate}
                    </div>

                    <div style={{
                      fontFamily: "'Oswald', sans-serif", fontSize: '15px', fontWeight: 700,
                      color: '#39ff8c', width: '100px', textAlign: 'right'
                    }}>
                      {player.points.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'rgba(255,255,255,0.2)', fontSize: '10px', marginTop: '10px' }}>
            <Star size={10} color="rgba(57,255,140,0.3)" /> Actualizado globalmente en tiempo real <Star size={10} color="rgba(57,255,140,0.3)" />
          </div>

        </div>
      </div>
    </>
  );
}