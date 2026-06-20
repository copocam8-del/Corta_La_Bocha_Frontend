import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Copy, Check, Crown, Play, Users, Clock, Swords, Globe } from 'lucide-react';

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_PLAYERS = [
  { id: '1', name: 'Vos', isHost: true,  points: 0, ready: true },
  { id: '2', name: 'Ramiro',  isHost: false, points: 0, ready: true },
  { id: '3', name: 'Sofi',    isHost: false, points: 0, ready: true },
];

const TEMATICAS = [
  { id: 'general',        label: 'General' },
  { id: 'liga_argentina', label: 'Liga Argentina' },
  { id: 'mundial',        label: 'Mundial' },
  { id: 'champions',      label: 'Champions' },
  { id: 'libertadores',   label: 'Libertadores' },
];
const DIFICULTADES = [
  { id: 'facil',   label: 'Fácil' },
  { id: 'medio',   label: 'Medio' },
  { id: 'dificil', label: 'Difícil' },
  { id: 'experto', label: 'Experto' },
];
const TIEMPOS = [30, 45, 60, 90, 120];

const MAX_PLAYERS = 15;

// ─── Component ────────────────────────────────────────────────────────────────
export default function Room() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { code }  = useParams<{ code: string }>();

  const {
    tematica:   initTematica   = 'general',
    dificultad: initDificultad = 'medio',
    tiempo:     initTiempo     = 60,
    isHost:     initIsHost     = false,
  } = (location.state || {}) as {
    tematica?: string; dificultad?: string; tiempo?: number; isHost?: boolean; code?: string;
  };

  const [entered,    setEntered]    = useState(false);
  const [copied,     setCopied]     = useState(false);
  const [tematica,   setTematica]   = useState(initTematica);
  const [dificultad, setDificultad] = useState(initDificultad);
  const [tiempo,     setTiempo]     = useState(initTiempo);
  const [players,    setPlayers]    = useState(MOCK_PLAYERS);
  const isHost = initIsHost;

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Simula un jugador que se une después de 3s (mock)
  useEffect(() => {
    if (!isHost) return;
    const t = setTimeout(() => {
      setPlayers(prev => {
        if (prev.find(p => p.id === '4')) return prev;
        if (prev.length >= MAX_PLAYERS) return prev;
        return [...prev, { id: '4', name: 'Lucas', isHost: false, points: 0, ready: true }];
      });
    }, 3000);
    return () => clearTimeout(t);
  }, [isHost]);

  const sparks = useMemo(
    () =>
      Array.from({ length: 16 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 2 + Math.random() * 3,
        duration: 6 + Math.random() * 5,
        delay: Math.random() * 7,
        dx: (Math.random() - 0.5) * 40,
      })),
    []
  );

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const canStart = players.length >= 2;
  const isFull   = players.length >= MAX_PLAYERS;

  const handleJugar = () => {
    navigate('/game-multi', {
      state: { tematica, dificultad, tiempo, players, code, isHost },
    });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes kenBurns {
          0%   { transform: scale(1) translate(0,0); }
          100% { transform: scale(1.06) translate(-1%,-1%); }
        }
        @keyframes floodPulse {
          0%, 100% { opacity: 0.5; }
          50%      { opacity: 0.9; }
        }
        @keyframes lineGlow {
          0%, 100% { opacity: 0.35; }
          50%      { opacity: 0.75; }
        }
        @keyframes neonPulse {
          0%, 100% {
            box-shadow: 0 0 18px rgba(57,255,140,0.25), 0 0 40px rgba(57,255,140,0.1);
            border-color: rgba(57,255,140,0.3);
          }
          50% {
            box-shadow: 0 0 28px rgba(57,255,140,0.5), 0 0 60px rgba(57,255,140,0.2);
            border-color: rgba(57,255,140,0.7);
          }
        }
        @keyframes riseIn {
          0%   { opacity: 0; transform: translateY(22px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes titleGlow {
          0%, 100% { text-shadow: 0 0 16px rgba(57,255,140,0.45), 0 0 36px rgba(57,255,140,0.2); }
          50%      { text-shadow: 0 0 24px rgba(57,255,140,0.75), 0 0 54px rgba(57,255,140,0.4); }
        }
        @keyframes playerIn {
          0%   { opacity: 0; transform: translateX(-16px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes drift {
          0%   { transform: translate(0,0); opacity: 0; }
          15%  { opacity: 0.9; }
          100% { transform: translate(var(--dx),-160px); opacity: 0; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.4; }
        }

        .lobby-card { animation: neonPulse 4s ease-in-out infinite; }
        .neon-title { animation: titleGlow 2.6s ease-in-out infinite; }
        .section-label {
          font-family: 'Oswald', sans-serif;
          font-size: 11px; letter-spacing: 3px;
          color: rgba(124,255,178,0.6); text-transform: uppercase;
          margin-bottom: 8px;
        }
        .option-btn {
          font-family: 'Oswald', sans-serif; font-size: 12px; font-weight: 600;
          letter-spacing: 1.5px; text-transform: uppercase;
          padding: 7px 12px; border-radius: 8px;
          border: 1px solid rgba(57,255,140,0.2);
          background: rgba(57,255,140,0.03);
          color: rgba(180,255,205,0.55); cursor: pointer;
          transition: all 0.18s ease; flex: 1; text-align: center;
        }
        .option-btn:hover {
          border-color: rgba(57,255,140,0.5); background: rgba(57,255,140,0.07); color: #eafff2;
        }
        .option-btn.active {
          border-color: #39ff8c; background: rgba(57,255,140,0.12);
          color: #39ff8c; box-shadow: 0 0 12px rgba(57,255,140,0.2);
        }
        .option-btn:disabled {
          opacity: 0.4; cursor: not-allowed;
        }
        .jugar-btn {
          background: linear-gradient(135deg, #0fae5d, #39ff8c);
          color: #04210f; font-family: 'Oswald', sans-serif; font-weight: 700;
          font-size: 16px; letter-spacing: 3px; padding: 14px;
          border-radius: 10px; border: none; cursor: pointer; width: 100%;
          text-transform: uppercase; display: flex; align-items: center;
          justify-content: center; gap: 8px; transition: all 0.2s ease;
          box-shadow: 0 0 22px rgba(57,255,140,0.35);
        }
        .jugar-btn:hover:not(:disabled) {
          filter: brightness(1.1); box-shadow: 0 0 36px rgba(57,255,140,0.55); transform: translateY(-1px);
        }
        .jugar-btn:disabled {
          background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.2);
          cursor: not-allowed; box-shadow: none;
        }
        .player-row {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 12px; border-radius: 10px;
          background: rgba(57,255,140,0.03);
          border: 1px solid rgba(57,255,140,0.1);
          animation: playerIn 0.35s ease both;
        }
        .avatar {
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: rgba(57,255,140,0.1);
          border: 1px solid rgba(57,255,140,0.3);
          font-family: 'Oswald', sans-serif;
          font-size: 14px; font-weight: 700; color: #39ff8c;
          flex-shrink: 0;
        }
        .waiting-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: rgba(57,255,140,0.4);
          animation: pulse 1.4s ease-in-out infinite;
        }
      `}</style>

      {/* FONDO */}
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
              radial-gradient(ellipse 90% 70% at 15% 0%, rgba(57,255,140,0.45) 0%, transparent 60%),
              radial-gradient(ellipse 90% 70% at 85% 0%, rgba(57,255,140,0.35) 0%, transparent 60%),
              linear-gradient(180deg, rgba(2,10,6,0.55) 0%, rgba(2,8,5,0.35) 40%, rgba(1,5,3,0.7) 100%)
            `,
            mixBlendMode: 'screen',
          }}/>
          <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.5, animation: 'lineGlow 4.5s ease-in-out infinite' }}>
            <defs>
              <filter id="neonLine2" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <g stroke="#7CFFB2" strokeWidth="4" fill="none" filter="url(#neonLine2)">
              <rect x="80" y="60" width="1440" height="780"/>
              <line x1="800" y1="60" x2="800" y2="840"/>
              <circle cx="800" cy="450" r="130"/>
              <circle cx="800" cy="450" r="6" fill="#7CFFB2"/>
              <rect x="80" y="290" width="240" height="320"/>
              <path d="M 320,350 A 150,150 0 0,1 320,550"/>
              <rect x="1280" y="290" width="240" height="320"/>
              <path d="M 1280,350 A 150,150 0 0,0 1280,550"/>
            </g>
          </svg>
          <div style={{
            position: 'absolute', top: '-8%', left: '4%',
            width: '34%', height: '34%', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(120,255,180,0.5) 0%, transparent 70%)',
            animation: 'floodPulse 5s ease-in-out infinite',
          }}/>
          <div style={{
            position: 'absolute', top: '-8%', right: '4%',
            width: '34%', height: '34%', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(120,255,180,0.45) 0%, transparent 70%)',
            animation: 'floodPulse 5s ease-in-out 1s infinite',
          }}/>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 70% 70% at 50% 48%, transparent 35%, rgba(0,4,2,0.78) 100%)',
          }}/>
        </div>

        {sparks.map(s => (
          <div key={s.id} style={{
            position: 'absolute', bottom: '30%', left: `${s.left}%`,
            width: `${s.size}px`, height: `${s.size}px`, borderRadius: '50%',
            background: 'rgba(160,255,200,0.9)',
            boxShadow: '0 0 8px rgba(57,255,140,0.8)',
            animation: `drift ${s.duration}s ease-out ${s.delay}s infinite`,
            '--dx': `${s.dx}px`,
            pointerEvents: 'none',
          } as React.CSSProperties}/>
        ))}
      </div>

      {/* CONTENIDO */}
      <div style={{
        position: 'relative', zIndex: 1,
        minHeight: '100vh',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '24px',
        fontFamily: "'Inter', sans-serif",
        overflowY: 'auto',
      }}>
        <div style={{
          width: '100%', maxWidth: '480px',
          display: 'flex', flexDirection: 'column', gap: '12px',
          paddingTop: '16px',
          opacity: entered ? 1 : 0,
          animation: entered ? 'riseIn 0.6s ease both' : 'none',
        }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <p style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: '11px', letterSpacing: '3px',
              color: '#7CFFB2', textTransform: 'uppercase', marginBottom: '6px',
            }}>Sala Privada</p>
            <h1 className="neon-title" style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: '26px', fontWeight: 700,
              color: '#eafff2', textTransform: 'uppercase', letterSpacing: '1px',
            }}>Sala de espera</h1>

            {/* Código en header */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              marginTop: '10px', padding: '6px 14px',
              border: '1px solid rgba(57,255,140,0.3)', borderRadius: '20px',
              background: 'rgba(57,255,140,0.05)',
              cursor: 'pointer',
            }} onClick={handleCopyCode}>
              <span style={{
                fontFamily: "'Oswald', sans-serif", fontSize: '16px', fontWeight: 700,
                color: '#39ff8c', letterSpacing: '4px',
                textShadow: '0 0 12px rgba(57,255,140,0.6)',
              }}>{code}</span>
              {copied
                ? <Check size={14} strokeWidth={2.5} color="#39ff8c"/>
                : <Copy size={14} strokeWidth={1.5} color="rgba(124,255,178,0.5)"/>
              }
            </div>
          </div>

          {/* Jugadores */}
          <div className="lobby-card" style={{
            background: 'rgba(4,20,11,0.62)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border: '1px solid rgba(57,255,140,0.3)',
            borderTop: '2px solid rgba(57,255,140,0.7)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 30px 60px -20px rgba(0,0,0,0.75)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '14px',
            }}>
              <p className="section-label" style={{ marginBottom: 0 }}>
                <Users size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}/>
                Jugadores ({players.length}/{MAX_PLAYERS})
              </p>
              {!canStart && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div className="waiting-dot"/>
                  <span style={{
                    fontFamily: "'Oswald', sans-serif", fontSize: '10px',
                    color: 'rgba(124,255,178,0.5)', letterSpacing: '1px', textTransform: 'uppercase',
                  }}>Esperando...</span>
                </div>
              )}
              {isFull && (
                <span style={{
                  fontFamily: "'Oswald', sans-serif", fontSize: '10px',
                  color: '#fbbf24', letterSpacing: '1px', textTransform: 'uppercase',
                }}>¡Sala llena!</span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {players.map((p, i) => (
                <div key={p.id} className="player-row" style={{ animationDelay: `${i * 0.07}s` }}>
                  <div className="avatar">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        fontFamily: "'Oswald', sans-serif", fontSize: '14px', fontWeight: 600,
                        color: '#eafff2', letterSpacing: '0.5px',
                      }}>{p.name}</span>
                      {p.isHost && (
                        <Crown size={12} strokeWidth={1.5} color="#fbbf24"/>
                      )}
                    </div>
                  </div>
                  <span style={{
                    fontFamily: "'Oswald', sans-serif", fontSize: '13px', fontWeight: 700,
                    color: '#39ff8c',
                  }}>{p.points} pts</span>
                </div>
              ))}
            </div>
          </div>

          {/* Config (solo anfitrión) */}
          {isHost && (
            <div className="lobby-card" style={{
              background: 'rgba(4,20,11,0.62)',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              border: '1px solid rgba(57,255,140,0.3)',
              borderTop: '2px solid rgba(57,255,140,0.7)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 30px 60px -20px rgba(0,0,0,0.75)',
              display: 'flex', flexDirection: 'column', gap: '14px',
            }}>
              <div>
                <p className="section-label">
                  <Globe size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}/>
                  Temática
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {TEMATICAS.map(t => (
                    <button key={t.id} className={`option-btn${tematica === t.id ? ' active' : ''}`}
                      style={{ flex: 'none' }} onClick={() => setTematica(t.id)}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="section-label">
                  <Swords size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}/>
                  Dificultad
                </p>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {DIFICULTADES.map(d => (
                    <button key={d.id} className={`option-btn${dificultad === d.id ? ' active' : ''}`}
                      onClick={() => setDificultad(d.id)}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="section-label">
                  <Clock size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}/>
                  Tiempo
                </p>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {TIEMPOS.map(t => (
                    <button key={t} className={`option-btn${tiempo === t ? ' active' : ''}`}
                      onClick={() => setTiempo(t)}>
                      {t}s
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Botón jugar */}
          {isHost && (
            <button className="jugar-btn" disabled={!canStart} onClick={handleJugar}>
              <Play size={18} strokeWidth={2}/>
              {canStart ? '¡Jugar!' : `Esperando jugadores (${players.length}/2 mín)`}
            </button>
          )}

          {!isHost && (
            <div style={{
              textAlign: 'center', padding: '14px',
              background: 'rgba(4,20,11,0.5)',
              border: '1px solid rgba(57,255,140,0.15)',
              borderRadius: '10px',
              backdropFilter: 'blur(10px)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <div className="waiting-dot"/>
                <span style={{
                  fontFamily: "'Oswald', sans-serif", fontSize: '13px', fontWeight: 600,
                  color: 'rgba(124,255,178,0.6)', letterSpacing: '2px', textTransform: 'uppercase',
                }}>Esperando al anfitrión...</span>
              </div>
            </div>
          )}

          <p onClick={() => navigate('/lobby')} style={{
            textAlign: 'center', color: 'rgba(180,255,205,0.4)',
            fontSize: '12px', marginTop: '4px', cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
          }}>← Volver al Lobby</p>
        </div>
      </div>
    </>
  );
}