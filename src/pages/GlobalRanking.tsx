import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Medal, ArrowLeft, Shield, Star } from 'lucide-react';

const MOCK_RANKING = [
  { id: 1, name: 'BatiGol_9', points: 15420, matches: 142, winRate: '68%' },
  { id: 2, name: 'Cami_Dev', points: 14850, matches: 120, winRate: '72%' },
  { id: 3, name: 'Nico_Flex', points: 13900, matches: 135, winRate: '59%' },
  { id: 4, name: 'ReyArturo', points: 12100, matches: 110, winRate: '55%' },
  { id: 5, name: 'Pulga10', points: 11850, matches: 95, winRate: '80%' },
  { id: 6, name: 'Chino_Z', points: 10400, matches: 102, winRate: '51%' },
  { id: 7, name: 'Dibu_23', points: 9950, matches: 88, winRate: '64%' },
  { id: 8, name: 'Fideo_Malco', points: 9200, matches: 84, winRate: '60%' },
  { id: 9, name: 'Caruso_In', points: 8500, matches: 90, winRate: '42%' },
  { id: 10, name: 'Scaloneta_Fan', points: 8100, matches: 72, winRate: '58%' },
];

export default function GlobalRanking() {
  const navigate = useNavigate();
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

  const podio = MOCK_RANKING.slice(0, 3);
  const restoDelTop = MOCK_RANKING.slice(3);

  const getMedalColor = (pos: number) => {
    if (pos === 1) return '#fbbf24'; 
    if (pos === 2) return '#cbd5e1'; 
    return '#b45309'; 
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@300;400;500;600&display=swap');
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
        padding: '24px', fontFamily: "'Inter', sans-serif", overflowY: 'auto',
      }}>
        <div style={{
          width: '100%', maxWidth: '680px',
          display: 'flex', flexDirection: 'column', gap: '20px',
          opacity: entered ? 1 : 0,
          transition: 'opacity 0.4s ease',
          animation: entered ? 'riseIn 0.5s ease both' : 'none',
        }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button className="back-btn" onClick={() => navigate('/lobby')}>
              <ArrowLeft size={14} /> Volver
            </button>
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
              <Trophy size={32} color="#fbbf24" strokeWidth={2} /> RANKING GLOBAL
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '4px', letterSpacing: '1px' }}>
              Los mejores directores técnicos del juego de respuestas futboleras
            </p>
          </div>

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
                <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: '16px', fontWeight: 700, color: '#cbd5e1', marginTop: '2px' }}>{podio[1].points.toLocaleString()} pts</p>
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
                <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: '20px', fontWeight: 700, color: '#fbbf24', marginTop: '2px' }}>{podio[0].points.toLocaleString()} pts</p>
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
                <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: '16px', fontWeight: 700, color: '#b45309', marginTop: '2px' }}>{podio[2].points.toLocaleString()} pts</p>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)' }}>{podio[2].winRate} WR</span>
              </div>
            )}
          </div>

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
              <div style={{ width: '100px', textAlign: 'right' }}>Puntos</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '340px', overflowY: 'auto', paddingRight: '4px' }}>
              {restoDelTop.map((player) => {
                const isMe = player.name === 'Cami_Dev'; 

                return (
                  <div key={player.id} className={`rank-row${isMe ? ' me' : ''}`}>
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