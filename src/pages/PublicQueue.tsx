import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, X } from 'lucide-react';

const MOCK_NAMES = ['Ramiro', 'Sofi', 'Lucas', 'Agus', 'Manu', 'Vale', 'Nico', 'Caro', 'Fer', 'Tomi', 'Juli', 'Seba', 'Flor', 'Nacho'];

function randomBetween(a: number, b: number) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

export default function PublicQueue() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tematica, dificultad, tiempo, cantidad, min, max } = (location.state || {}) as {
    tematica: string; dificultad: string; tiempo: number;
    cantidad: string; min: number; max: number;
  };

  const [entered,   setEntered]   = useState(false);
  const [players,   setPlayers]   = useState([{ id: 'me', name: 'Vos', isHost: true, points: 0, ready: true }]);
  const [searching, setSearching] = useState(true);
  const [canStart,  setCanStart]  = useState(false);
  const [dots,      setDots]      = useState('');
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const usedNames   = useRef<Set<string>>(new Set(['Vos']));

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Animación de puntos suspensivos
  useEffect(() => {
    if (!searching) return;
    const i = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    return () => clearInterval(i);
  }, [searching]);

  // Mock: va sumando jugadores aleatoriamente hasta el mínimo
  useEffect(() => {
    if (!tematica) return;
    const targetCount = randomBetween(min, Math.min(min + 2, max));
    let added = 0;

    const addPlayer = () => {
      if (added >= targetCount - 1) return;
      const available = MOCK_NAMES.filter(n => !usedNames.current.has(n));
      if (!available.length) return;
      const name = available[Math.floor(Math.random() * available.length)];
      usedNames.current.add(name);
      setPlayers(prev => [...prev, { id: `p${added}`, name, isHost: false, points: 0, ready: true }]);
      added++;
      if (added >= targetCount - 1) {
        setSearching(false);
        setCanStart(true);
      } else {
        const t = setTimeout(addPlayer, randomBetween(1200, 2800));
        timeoutRefs.current.push(t);
      }
    };

    const t = setTimeout(addPlayer, randomBetween(800, 1800));
    timeoutRefs.current.push(t);
    return () => timeoutRefs.current.forEach(clearTimeout);
  }, []);

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

  const handleJugar = () => {
    navigate('/game-multi', { state: { tematica, dificultad, tiempo, players, code: 'PUB', isHost: true } });
  };

  const handleCancelar = () => {
    timeoutRefs.current.forEach(clearTimeout);
    navigate('/lobby');
  };

  if (!tematica) { navigate('/lobby'); return null; }

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
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.4; }
        }
        @keyframes radarSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes radarPing {
          0%   { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        .lobby-card { animation: neonPulse 4s ease-in-out infinite; }
        .neon-title { animation: titleGlow 2.6s ease-in-out infinite; }

        .player-row {
          display: flex; align-items: center; gap: 12px;
          padding: 9px 12px; border-radius: 10px;
          background: rgba(57,255,140,0.03);
          border: 1px solid rgba(57,255,140,0.1);
          animation: playerIn 0.35s ease both;
        }
        .player-row.me {
          background: rgba(57,255,140,0.07);
          border-color: rgba(57,255,140,0.3);
        }
        .avatar {
          width: 34px; height: 34px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: rgba(57,255,140,0.1); border: 1px solid rgba(57,255,140,0.3);
          font-family: 'Oswald', sans-serif; font-size: 13px; font-weight: 700;
          color: #39ff8c; flex-shrink: 0;
        }
        .waiting-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: rgba(57,255,140,0.4);
          animation: pulse 1.4s ease-in-out infinite;
        }
        .jugar-btn {
          background: linear-gradient(135deg, #0fae5d, #39ff8c);
          color: #04210f; font-family: 'Oswald', sans-serif; font-weight: 700;
          font-size: 16px; letter-spacing: 3px; padding: 14px;
          border-radius: 10px; border: none; cursor: pointer; width: 100%;
          text-transform: uppercase; display: flex; align-items: center;
          justify-content: center; gap: 8px; transition: all 0.2s ease;
          box-shadow: 0 0 22px rgba(57,255,140,0.4);
        }
        .jugar-btn:hover {
          filter: brightness(1.1); box-shadow: 0 0 36px rgba(57,255,140,0.6); transform: translateY(-1px);
        }
        .cancelar-btn {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          width: 100%; padding: 11px;
          border: 1px solid rgba(239,68,68,0.3); border-radius: 10px;
          background: rgba(239,68,68,0.04); color: rgba(239,68,68,0.7);
          font-family: 'Oswald', sans-serif; font-size: 13px; font-weight: 600;
          letter-spacing: 2px; text-transform: uppercase;
          cursor: pointer; transition: all 0.18s ease;
        }
        .cancelar-btn:hover {
          border-color: rgba(239,68,68,0.6); background: rgba(239,68,68,0.08); color: #ef4444;
        }
      `}</style>

      {/* FONDO */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', background: '#010805' }}>
        <div style={{
          position: 'absolute', inset: '-3%',
          animation: 'kenBurns 24s ease-in-out infinite alternate', pointerEvents: 'none',
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
              <filter id="neonLineQ" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <g stroke="#7CFFB2" strokeWidth="4" fill="none" filter="url(#neonLineQ)">
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
            position: 'absolute', top: '-8%', left: '4%', width: '34%', height: '34%', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(120,255,180,0.5) 0%, transparent 70%)',
            animation: 'floodPulse 5s ease-in-out infinite',
          }}/>
          <div style={{
            position: 'absolute', top: '-8%', right: '4%', width: '34%', height: '34%', borderRadius: '50%',
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
            background: 'rgba(160,255,200,0.9)', boxShadow: '0 0 8px rgba(57,255,140,0.8)',
            animation: `drift ${s.duration}s ease-out ${s.delay}s infinite`,
            '--dx': `${s.dx}px`, pointerEvents: 'none',
          } as React.CSSProperties}/>
        ))}
      </div>

      {/* CONTENIDO */}
      <div style={{
        position: 'relative', zIndex: 1, minHeight: '100vh',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '24px', fontFamily: "'Inter', sans-serif", overflowY: 'auto',
      }}>
        <div style={{
          width: '100%', maxWidth: '420px',
          display: 'flex', flexDirection: 'column', gap: '12px',
          paddingTop: '24px',
          opacity: entered ? 1 : 0,
          animation: entered ? 'riseIn 0.6s ease both' : 'none',
        }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <p style={{
              fontFamily: "'Oswald', sans-serif", fontSize: '11px', letterSpacing: '3px',
              color: '#7CFFB2', textTransform: 'uppercase', marginBottom: '10px',
            }}>Partida Pública</p>

            {/* Radar animado */}
            <div style={{
              position: 'relative', width: '72px', height: '72px',
              margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {searching && (
                <>
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    border: '2px solid rgba(57,255,140,0.3)',
                    animation: 'radarPing 1.6s ease-out infinite',
                  }}/>
                  <div style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    border: '2px solid rgba(57,255,140,0.2)',
                    animation: 'radarPing 1.6s ease-out 0.5s infinite',
                  }}/>
                </>
              )}
              <div style={{
                width: '52px', height: '52px', borderRadius: '50%',
                border: `2px solid ${canStart ? '#39ff8c' : 'rgba(57,255,140,0.5)'}`,
                background: 'rgba(4,20,11,0.8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: canStart ? '0 0 20px rgba(57,255,140,0.4)' : 'none',
                transition: 'all 0.4s ease',
              }}>
                <Users size={22} strokeWidth={1.5} color={canStart ? '#39ff8c' : 'rgba(57,255,140,0.6)'}/>
              </div>
            </div>

            <h1 className="neon-title" style={{
              fontFamily: "'Oswald', sans-serif", fontSize: '24px', fontWeight: 700,
              color: '#eafff2', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px',
            }}>
              {canStart ? '¡Partida lista!' : `Buscando${dots}`}
            </h1>
            <p style={{ fontSize: '12px', color: 'rgba(180,255,205,0.6)', margin: 0 }}>
              {tematica.replace('_', ' ')} · {dificultad} · {tiempo}s
            </p>
          </div>

          {/* Lista de jugadores */}
          <div className="lobby-card" style={{
            background: 'rgba(4,20,11,0.62)', backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border: '1px solid rgba(57,255,140,0.3)',
            borderTop: '2px solid rgba(57,255,140,0.7)',
            borderRadius: '16px', padding: '20px',
            boxShadow: '0 30px 60px -20px rgba(0,0,0,0.75)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '14px',
            }}>
              <p style={{
                fontFamily: "'Oswald', sans-serif", fontSize: '11px', letterSpacing: '3px',
                color: 'rgba(124,255,178,0.6)', textTransform: 'uppercase', margin: 0,
              }}>
                <Users size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }}/>
                Jugadores ({players.length}/{max})
              </p>
              {searching && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div className="waiting-dot"/>
                  <span style={{
                    fontFamily: "'Oswald', sans-serif", fontSize: '10px',
                    color: 'rgba(124,255,178,0.5)', letterSpacing: '1px', textTransform: 'uppercase',
                  }}>Buscando...</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {players.map((p, i) => (
                <div key={p.id} className={`player-row${p.id === 'me' ? ' me' : ''}`}
                  style={{ animationDelay: `${i * 0.07}s` }}>
                  <div className="avatar">{p.name.charAt(0).toUpperCase()}</div>
                  <span style={{
                    fontFamily: "'Oswald', sans-serif", fontSize: '14px', fontWeight: 600,
                    color: p.id === 'me' ? '#39ff8c' : '#eafff2', letterSpacing: '0.5px', flex: 1,
                  }}>
                    {p.name}{p.id === 'me' ? ' (vos)' : ''}
                  </span>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: '#39ff8c', boxShadow: '0 0 6px rgba(57,255,140,0.7)',
                  }}/>
                </div>
              ))}
            </div>
          </div>

          {/* Botón jugar / cancelar */}
          {canStart ? (
            <button className="jugar-btn" onClick={handleJugar}>
              ¡Jugar!
            </button>
          ) : (
            <button className="cancelar-btn" onClick={handleCancelar}>
              <X size={16} strokeWidth={2}/>
              Cancelar búsqueda
            </button>
          )}
        </div>
      </div>
    </>
  );
}