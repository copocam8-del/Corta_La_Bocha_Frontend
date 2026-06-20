import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Home, KeyRound, Globe, Trophy } from 'lucide-react';

export default function Lobby() {
  const [entered, setEntered] = useState(false);
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 80);
    return () => clearTimeout(t);
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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes kenBurns {
          0%   { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.06) translate(-1%, -1%); }
        }
        @keyframes floodPulse {
          0%, 100% { opacity: 0.5; }
          50%      { opacity: 0.9; }
        }
        @keyframes neonPulse {
          0%, 100% {
            box-shadow: 0 0 14px rgba(57,255,140,0.25), 0 0 30px rgba(57,255,140,0.1), inset 0 0 0 rgba(0,0,0,0);
            border-color: rgba(57,255,140,0.35);
          }
          50% {
            box-shadow: 0 0 22px rgba(57,255,140,0.45), 0 0 45px rgba(57,255,140,0.2), inset 0 0 0 rgba(0,0,0,0);
            border-color: rgba(57,255,140,0.75);
          }
        }
        @keyframes lineGlow {
          0%, 100% { opacity: 0.4; }
          50%      { opacity: 0.85; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes drift {
          0%   { transform: translate(0, 0); opacity: 0; }
          15%  { opacity: 0.9; }
          100% { transform: translate(var(--dx), -160px); opacity: 0; }
        }
        @keyframes riseIn {
          0%   { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          0%   { opacity: 0; transform: scale(0.7) rotate(-15deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes titleGlow {
          0%, 100% { text-shadow: 0 0 12px rgba(57,255,140,0.35), 0 0 26px rgba(57,255,140,0.15); }
          50%      { text-shadow: 0 0 18px rgba(57,255,140,0.6), 0 0 40px rgba(57,255,140,0.3); }
        }
        @keyframes slideDown {
          0%   { opacity: 0; transform: translateY(-8px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .ball-logo {
          animation: spin 14s linear infinite;
          transform-origin: center center;
        }
        .neon-title {
          animation: titleGlow 2.6s ease-in-out infinite;
        }
        .lobby-card {
          animation: neonPulse 4s ease-in-out infinite;
        }

        .mode-card {
          border: 1px solid rgba(57,255,140,0.15);
          background: rgba(57,255,140,0.02);
          border-radius: 10px;
          padding: 10px 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #ecfff3;
          font-family: 'Inter', sans-serif;
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          text-align: left;
        }
        .mode-card:hover {
          border-color: rgba(57,255,140,0.5);
          background: rgba(57,255,140,0.06);
          transform: translateX(4px);
          box-shadow: 0 0 15px rgba(57,255,140,0.12);
        }

        .mode-card-icon {
          min-width: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #39ff8c;
        }

        .join-input {
          background: rgba(10,30,18,0.5);
          border: 1px solid rgba(57,255,140,0.35);
          color: #ecfff3;
          width: 100%;
          padding: 10px 12px;
          border-radius: 6px;
          font-size: 15px;
          font-family: 'Oswald', sans-serif;
          font-weight: 600;
          letter-spacing: 4px;
          outline: none;
          text-transform: uppercase;
          text-align: center;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .join-input::placeholder {
          color: rgba(190,255,210,0.3);
          letter-spacing: 2px;
          font-size: 12px;
        }
        .join-input:focus {
          border-color: #39ff8c;
          box-shadow: 0 0 0 3px rgba(57,255,140,0.12), 0 0 14px rgba(57,255,140,0.25);
        }

        .join-btn {
          background: linear-gradient(135deg, #0fae5d, #39ff8c);
          color: #04210f;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 13px;
          letter-spacing: 1px;
          padding: 10px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          width: 100%;
          transition: all 0.2s ease;
          box-shadow: 0 0 14px rgba(57,255,140,0.3);
        }
        .join-btn:hover:not(:disabled) {
          filter: brightness(1.1);
          box-shadow: 0 0 20px rgba(57,255,140,0.5);
        }
        .join-btn:disabled { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.2); cursor: not-allowed; box-shadow: none; }

        .section-label {
          font-family: 'Oswald', sans-serif;
          font-size: 10px;
          letter-spacing: 2px;
          color: rgba(124,255,178,0.55);
          text-transform: uppercase;
          margin-bottom: 4px;
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '12px 24px',
        background: '#010805',
        fontFamily: "'Inter', sans-serif",
      }}>

        {/* CANCHA */}
        <div style={{
          position: 'absolute', inset: '-3%',
          animation: 'kenBurns 24s ease-in-out infinite alternate',
          pointerEvents: 'none',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: `repeating-linear-gradient(
              115deg,
              #052e16 0px, #052e16 80px,
              #064a22 80px, #064a22 160px
            )`,
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

          <svg
            viewBox="0 0 1600 900"
            preserveAspectRatio="xMidYMid slice"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.55, animation: 'lineGlow 4.5s ease-in-out infinite' }}
          >
            <defs>
              <filter id="neonLine" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <g stroke="#7CFFB2" strokeWidth="4" fill="none" filter="url(#neonLine)">
              <rect x="80" y="60" width="1440" height="780"/>
              <line x1="800" y1="60" x2="800" y2="840"/>
              <circle cx="800" cy="450" r="130"/>
              <circle cx="800" cy="450" r="6" fill="#7CFFB2"/>
              <rect x="80" y="290" width="240" height="320"/>
              <path d="M 320,350 A 150,150 0 0,1 320,550"/>
              <rect x="1280" y="290" width="240" height="320"/>
              <path d="M 1280,350 A 150,150 0 0,0 1280,550"/>
              <path d="M 110,60 A 30,30 0 0,1 80,90"/>
              <path d="M 1520,90 A 30,30 0 0,1 1490,60"/>
              <path d="M 1490,840 A 30,30 0 0,1 1520,810"/>
              <path d="M 80,810 A 30,30 0 0,1 110,840"/>
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

        {/* motas de luz flotando */}
        {sparks.map(s => (
          <div key={s.id} style={{
            position: 'absolute', bottom: '30%', left: `${s.left}%`,
            width: `${s.size}px`, height: `${s.size}px`,
            borderRadius: '50%',
            background: 'rgba(160,255,200,0.9)',
            boxShadow: '0 0 8px rgba(57,255,140,0.8)',
            animation: `drift ${s.duration}s ease-out ${s.delay}s infinite`,
            '--dx': `${s.dx}px`,
            pointerEvents: 'none',
          } as React.CSSProperties}/>
        ))}

        {/* CONTENIDO */}
        <div style={{ width: '100%', maxWidth: '400px', position: 'relative', zIndex: 2 }}>

          <div style={{
            textAlign: 'center', marginBottom: '14px',
            opacity: entered ? 1 : 0,
            animation: entered ? 'riseIn 0.6s ease both' : 'none',
          }}>
            <p style={{
              fontSize: '11px', letterSpacing: '3px', fontWeight: 500,
              color: '#7CFFB2', textTransform: 'uppercase', marginBottom: '6px',
            }}>Temporada 2026</p>

            <div
              className="ball-logo"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '46px', height: '46px',
                margin: '0 auto 8px',
                opacity: entered ? 1 : 0,
                animation: entered
                  ? 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.15s both, spin 14s linear infinite'
                  : 'none',
                filter: 'drop-shadow(0 0 12px rgba(57,255,140,0.55))',
              }}
            >
              <svg viewBox="0 0 64 64" width="46" height="46" style={{ display: 'block' }}>
                <circle cx="32" cy="32" r="29" fill="rgba(57,255,140,0.12)" stroke="#a8ffcb" strokeWidth="2.5"/>
                <polygon points="32,19 44.4,28 39.6,42.5 24.4,42.5 19.6,28" fill="#a8ffcb"/>
                <line x1="32" y1="19" x2="32" y2="5" stroke="#a8ffcb" strokeWidth="2"/>
                <line x1="44.4" y1="28" x2="57.7" y2="23.7" stroke="#a8ffcb" strokeWidth="2"/>
                <line x1="39.6" y1="42.5" x2="47.9" y2="53.8" stroke="#a8ffcb" strokeWidth="2"/>
                <line x1="24.4" y1="42.5" x2="16.1" y2="53.8" stroke="#a8ffcb" strokeWidth="2"/>
                <line x1="19.6" y1="28" x2="6.3" y2="23.7" stroke="#a8ffcb" strokeWidth="2"/>
              </svg>
            </div>

            <h1 className="neon-title" style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: '26px', fontWeight: 700,
              letterSpacing: '1px', margin: '0 0 4px',
              color: '#eafff2', textTransform: 'uppercase',
            }}>Jugar</h1>
            <p style={{
              fontSize: '12px', color: 'rgba(180,255,205,0.75)', margin: 0,
            }}>¿Cómo querés jugar?</p>
          </div>

          <div className="lobby-card" style={{
            background: 'rgba(4,20,11,0.65)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border: '1px solid rgba(57,255,140,0.25)',
            borderTop: '2px solid rgba(57,255,140,0.65)',
            borderRadius: '14px',
            padding: '16px 20px',
            boxShadow: '0 25px 50px -15px rgba(0,0,0,0.75)',
            opacity: entered ? 1 : 0,
            animation: entered ? 'riseIn 0.6s ease 0.1s both' : 'none',
            display: 'flex', flexDirection: 'column', gap: '8px',
          }}>

            {/* Solo */}
            <p className="section-label">Solo</p>
            <button className="mode-card" onClick={() => navigate('/game-setup')}>
              <span className="mode-card-icon"><Bot size={24} strokeWidth={1.5} /></span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px' }}>Contra la IA</div>
                <div style={{ fontSize: '11px', color: 'rgba(180,255,205,0.5)', marginTop: '1px' }}>Jugá solo contra la inteligencia artificial</div>
              </div>
            </button>

            {/* Con amigos */}
            <p className="section-label" style={{ marginTop: '4px' }}>Con amigos</p>

            <button className="mode-card" onClick={() => navigate('/create-room')}>
              <span className="mode-card-icon"><Home size={24} strokeWidth={1.5} /></span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px' }}>Crear sala privada</div>
                <div style={{ fontSize: '11px', color: 'rgba(180,255,205,0.5)', marginTop: '1px' }}>Creá una sala e invitá a tus amigos con un código</div>
              </div>
            </button>

            <button className="mode-card" onClick={() => setShowJoinInput(!showJoinInput)}>
              <span className="mode-card-icon"><KeyRound size={24} strokeWidth={1.5} /></span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px' }}>Unirse con código</div>
                <div style={{ fontSize: '11px', color: 'rgba(180,255,205,0.5)', marginTop: '1px' }}>Ingresá el código de una sala privada</div>
              </div>
            </button>

            {showJoinInput && (
              <div style={{ animation: 'slideDown 0.2s ease forwards', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <input
                  className="join-input"
                  placeholder="ABC123"
                  value={roomCode}
                  onChange={e => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={6}
                />
                <button
                  className="join-btn"
                  disabled={roomCode.length < 4}
                  onClick={() => navigate(`/room/${roomCode}`, { state: { isHost: false, code: roomCode } })}
                >
                  Unirse a la sala
                </button>
              </div>
            )}

            {/* Online */}
            <p className="section-label" style={{ marginTop: '4px' }}>Online</p>
            <button className="mode-card" onClick={() => navigate('/public-setup')}>
              <span className="mode-card-icon"><Globe size={24} strokeWidth={1.5} /></span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px' }}>Partida pública</div>
                <div style={{ fontSize: '11px', color: 'rgba(180,255,205,0.5)', marginTop: '1px' }}>Jugá contra alguien al azar en todo el mundo</div>
              </div>
            </button>

            {/* Estadísticas */}
            <p className="section-label" style={{ marginTop: '4px' }}>Estadísticas</p>
            <button className="mode-card" onClick={() => navigate('/ranking')}>
              <span className="mode-card-icon"><Trophy size={24} strokeWidth={1.5} /></span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px' }}>Ranking Global</div>
                <div style={{ fontSize: '11px', color: 'rgba(180,255,205,0.5)', marginTop: '1px' }}>Mirá las posiciones de los mejores directores técnicos</div>
              </div>
            </button>

          </div>

          <p onClick={() => navigate('/dashboard')} style={{
            textAlign: 'center', color: 'rgba(180,255,205,0.4)',
            fontSize: '11px', marginTop: '12px', cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
            opacity: entered ? 1 : 0,
            animation: entered ? 'fadeIn 0.6s ease 0.4s both' : 'none',
          }}>← Volver al Dashboard</p>
        </div>
      </div>
    </>
  );
}