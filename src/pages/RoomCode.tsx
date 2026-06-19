import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Copy, Share2, ChevronRight, Check } from 'lucide-react';

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export default function RoomCode() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tematica, dificultad, tiempo } = (location.state || {}) as {
    tematica: string; dificultad: string; tiempo: number;
  };

  const [entered, setEntered] = useState(false);
  const [copied, setCopied]   = useState(false);
  const [code] = useState(generateCode);

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

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Tutti Frutti Fútbol',
        text: `¡Sumate a mi sala! Código: ${code}`,
        url: `${window.location.origin}/join?code=${code}`,
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/join?code=${code}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleContinuar = () => {
    navigate(`/room/${code}`, { state: { tematica, dificultad, tiempo, code, isHost: true } });
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
        @keyframes codePop {
          0%   { opacity: 0; transform: scale(0.85); }
          70%  { transform: scale(1.04); }
          100% { opacity: 1; transform: scale(1); }
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
        @keyframes popIn {
          0%   { opacity: 0; transform: scale(0.7) rotate(-15deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }

        .lobby-card { animation: neonPulse 4s ease-in-out infinite; }
        .neon-title { animation: titleGlow 2.6s ease-in-out infinite; }

        .action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid rgba(57,255,140,0.3);
          background: rgba(57,255,140,0.05);
          color: #7CFFB2;
          font-family: 'Oswald', sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .action-btn:hover {
          border-color: rgba(57,255,140,0.7);
          background: rgba(57,255,140,0.1);
          box-shadow: 0 0 18px rgba(57,255,140,0.2);
        }
        .action-btn.copied {
          border-color: #39ff8c;
          color: #39ff8c;
          background: rgba(57,255,140,0.12);
        }

        .continuar-btn {
          background: linear-gradient(135deg, #0fae5d, #39ff8c);
          color: #04210f;
          font-family: 'Oswald', sans-serif;
          font-weight: 700;
          font-size: 15px;
          letter-spacing: 3px;
          padding: 13px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          width: 100%;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
          box-shadow: 0 0 22px rgba(57,255,140,0.35);
        }
        .continuar-btn:hover {
          filter: brightness(1.1);
          box-shadow: 0 0 36px rgba(57,255,140,0.55);
          transform: translateY(-1px);
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
              <filter id="neonLine" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
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
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
        fontFamily: "'Inter', sans-serif",
      }}>
        <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 2 }}>

          {/* Cabecera */}
          <div style={{
            textAlign: 'center', marginBottom: '26px',
            opacity: entered ? 1 : 0,
            animation: entered ? 'riseIn 0.6s ease both' : 'none',
          }}>
            <p style={{
              fontSize: '11px', letterSpacing: '3px', fontWeight: 500,
              color: '#7CFFB2', textTransform: 'uppercase', marginBottom: '12px',
              fontFamily: "'Oswald', sans-serif",
            }}>Sala Privada</p>

            <h1 className="neon-title" style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: '28px', fontWeight: 700,
              letterSpacing: '1px', margin: '0 0 6px',
              color: '#eafff2', textTransform: 'uppercase',
            }}>Código de sala</h1>
            <p style={{ fontSize: '13px', color: 'rgba(180,255,205,0.75)', margin: 0 }}>
              Compartilo con tus amigos para que se unan
            </p>
          </div>

          {/* Card */}
          <div className="lobby-card" style={{
            background: 'rgba(4,20,11,0.62)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border: '1px solid rgba(57,255,140,0.3)',
            borderTop: '2px solid rgba(57,255,140,0.7)',
            borderRadius: '16px',
            padding: '28px 24px',
            boxShadow: '0 30px 60px -20px rgba(0,0,0,0.75)',
            opacity: entered ? 1 : 0,
            animation: entered ? 'riseIn 0.6s ease 0.1s both' : 'none',
            display: 'flex', flexDirection: 'column', gap: '20px',
            textAlign: 'center',
          }}>

            {/* Código */}
            <div style={{
              animation: entered ? 'codePop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.3s both' : 'none',
            }}>
              <p style={{
                fontFamily: "'Oswald', sans-serif", fontSize: '11px',
                letterSpacing: '3px', color: 'rgba(124,255,178,0.6)',
                textTransform: 'uppercase', marginBottom: '12px',
              }}>Tu código</p>

              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                marginBottom: '6px',
              }}>
                {code.split('').map((char, i) => (
                  <div key={i} style={{
                    width: '46px', height: '58px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(57,255,140,0.06)',
                    border: '1px solid rgba(57,255,140,0.35)',
                    borderRadius: '8px',
                    boxShadow: '0 0 12px rgba(57,255,140,0.1)',
                  }}>
                    <span style={{
                      fontFamily: "'Oswald', sans-serif",
                      fontSize: '28px', fontWeight: 700,
                      color: '#39ff8c',
                      textShadow: '0 0 16px rgba(57,255,140,0.7)',
                    }}>{char}</span>
                  </div>
                ))}
              </div>

              {/* Config resumen */}
              <div style={{
                display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '12px', flexWrap: 'wrap',
              }}>
                {[tematica.replace('_', ' '), dificultad, `${tiempo}s`].map(tag => (
                  <span key={tag} style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: '10px', letterSpacing: '1.5px',
                    color: 'rgba(124,255,178,0.6)',
                    textTransform: 'uppercase',
                    padding: '3px 10px',
                    border: '1px solid rgba(57,255,140,0.2)',
                    borderRadius: '20px',
                    background: 'rgba(57,255,140,0.04)',
                  }}>{tag}</span>
                ))}
              </div>
            </div>

            {/* Botones copiar / compartir */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className={`action-btn${copied ? ' copied' : ''}`} onClick={handleCopy}>
                {copied ? <Check size={16} strokeWidth={2.5}/> : <Copy size={16} strokeWidth={1.5}/>}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
              <button className="action-btn" onClick={handleShare}>
                <Share2 size={16} strokeWidth={1.5}/>
                Compartir
              </button>
            </div>

            {/* Continuar */}
            <button className="continuar-btn" onClick={handleContinuar}>
              Ir a la sala
              <ChevronRight size={18} strokeWidth={2.5}/>
            </button>
          </div>

          <p onClick={() => navigate('/create-room')} style={{
            textAlign: 'center', color: 'rgba(180,255,205,0.4)',
            fontSize: '12px', marginTop: '16px', cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
            opacity: entered ? 1 : 0,
            animation: entered ? 'riseIn 0.6s ease 0.4s both' : 'none',
          }}>← Volver</p>
        </div>
      </div>
    </>
  );
}