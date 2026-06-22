import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const FRASES = [
  "Al toque, que no se enfría",
  "La pelota no se mancha",
  "Hoy se juega como se entrena",
  "El que no arriesga, no gana",
  "A cortar la bocha como los grandes",
  "La N° 5 ya está picando",
];

export default function Welcome() {
  const navigate = useNavigate();
  const [entered, setEntered] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const username = useMemo(() => localStorage.getItem('username') || 'crack', []);
  const name = useMemo(() => localStorage.getItem('name'), []);
  const displayName = name || username;
  const frase = useMemo(() => FRASES[Math.floor(Math.random() * FRASES.length)], []);

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

  useEffect(() => {
    const t1 = setTimeout(() => setEntered(true), 80);
    const t2 = setTimeout(() => setLeaving(true), 2400);
    const t3 = setTimeout(() => navigate('/lobby'), 2900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [navigate]);

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
          0%   { opacity: 0; transform: translateY(22px) scale(0.97); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeOut {
          0%   { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.97); }
        }
        @keyframes popIn {
          0%   { opacity: 0; transform: scale(0.7) rotate(-15deg); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes titleGlow {
          0%, 100% { text-shadow: 0 0 16px rgba(57,255,140,0.45), 0 0 36px rgba(57,255,140,0.2); }
          50%      { text-shadow: 0 0 24px rgba(57,255,140,0.75), 0 0 54px rgba(57,255,140,0.4); }
        }
        @keyframes barFill {
          from { width: 0%; }
          to   { width: 100%; }
        }

        .ball-logo { animation: spin 14s linear infinite; transform-origin: center center; }
        .neon-title { animation: titleGlow 2.6s ease-in-out infinite; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
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
            background: `repeating-linear-gradient(115deg, #052e16 0px, #052e16 80px, #064a22 80px, #064a22 160px)`,
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
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.55, animation: 'lineGlow 4.5s ease-in-out infinite' }}>
            <defs>
              <filter id="neonLineW" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <g stroke="#7CFFB2" strokeWidth="4" fill="none" filter="url(#neonLineW)">
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

        {/* CONTENIDO */}
        <div style={{
          width: '100%', maxWidth: '420px', position: 'relative', zIndex: 2,
          textAlign: 'center',
          opacity: entered && !leaving ? 1 : 0,
          animation: leaving
            ? 'fadeOut 0.5s ease both'
            : entered
              ? 'riseIn 0.6s cubic-bezier(0.22,1,0.36,1) both'
              : 'none',
        }}>
          <div className="ball-logo" style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '64px', height: '64px', marginBottom: '20px',
            filter: 'drop-shadow(0 0 16px rgba(57,255,140,0.65))',
          }}>
            <svg viewBox="0 0 64 64" width="64" height="64" style={{ display: 'block' }}>
              <circle cx="32" cy="32" r="29" fill="rgba(57,255,140,0.12)" stroke="#a8ffcb" strokeWidth="2.5"/>
              <polygon points="32,19 44.4,28 39.6,42.5 24.4,42.5 19.6,28" fill="#a8ffcb"/>
              <line x1="32" y1="19" x2="32" y2="5" stroke="#a8ffcb" strokeWidth="2"/>
              <line x1="44.4" y1="28" x2="57.7" y2="23.7" stroke="#a8ffcb" strokeWidth="2"/>
              <line x1="39.6" y1="42.5" x2="47.9" y2="53.8" stroke="#a8ffcb" strokeWidth="2"/>
              <line x1="24.4" y1="42.5" x2="16.1" y2="53.8" stroke="#a8ffcb" strokeWidth="2"/>
              <line x1="19.6" y1="28" x2="6.3" y2="23.7" stroke="#a8ffcb" strokeWidth="2"/>
            </svg>
          </div>

          <p style={{
            fontSize: '11px', letterSpacing: '3px', fontWeight: 500,
            color: '#7CFFB2', textTransform: 'uppercase', marginBottom: '10px',
          }}>¡Aguante!</p>

          <h1 className="neon-title" style={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: '34px', fontWeight: 700,
            letterSpacing: '0.5px', margin: '0 0 12px',
            color: '#eafff2', textTransform: 'uppercase',
            lineHeight: 1.15,
          }}>
            Bienvenido,<br/>{displayName}
          </h1>

          <p style={{
            fontSize: '14px', color: 'rgba(180,255,205,0.8)', margin: '0 0 28px',
            fontStyle: 'italic',
          }}>
            "{frase}"
          </p>

          <div style={{
            height: '3px', width: '160px', margin: '0 auto',
            background: 'rgba(57,255,140,0.15)', borderRadius: '2px', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', background: 'linear-gradient(90deg, #0fae5d, #39ff8c)',
              borderRadius: '2px',
              animation: 'barFill 2.4s linear forwards',
            }}/>
          </div>
        </div>
      </div>
    </>
  );
}