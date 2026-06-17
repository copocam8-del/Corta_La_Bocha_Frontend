import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircleDot, Flag, Globe, Star, Trophy, Smile, Meh, Angry, Flame, Timer } from 'lucide-react';

const TEMATICAS = [
  { id: 'general', nombre: 'General', icon: <CircleDot size={16} strokeWidth={1.5} /> },
  { id: 'liga_argentina', nombre: 'Liga Argentina', icon: <Flag size={16} strokeWidth={1.5} /> },
  { id: 'mundial', nombre: 'Mundial', icon: <Globe size={16} strokeWidth={1.5} /> },
  { id: 'champions', nombre: 'Champions League', icon: <Star size={16} strokeWidth={1.5} /> },
  { id: 'libertadores', nombre: 'Copa Libertadores', icon: <Trophy size={16} strokeWidth={1.5} /> },
];

const DIFICULTADES = [
  { id: 'facil', nombre: 'Fácil', icon: <Smile size={20} strokeWidth={1.5} />, descripcion: 'La IA responde lento y comete errores' },
  { id: 'medio', nombre: 'Medio', icon: <Meh size={20} strokeWidth={1.5} />, descripcion: 'Buen nivel y velocidad equilibrada' },
  { id: 'dificil', nombre: 'Difícil', icon: <Angry size={20} strokeWidth={1.5} />, descripcion: 'La IA es precisa y rápida' },
  { id: 'experto', nombre: 'Experto', icon: <Flame size={20} strokeWidth={1.5} />, descripcion: 'La IA es casi imbatible' },
];

const TIEMPOS = [
  { id: 60, nombre: '60 segundos' },
  { id: 120, nombre: '120 segundos' },
];

export default function GameSetup() {
  const [tematica, setTematica] = useState('');
  const [dificultad, setDificultad] = useState('');
  const [tiempo, setTiempo] = useState(60);
  const [phase, setPhase] = useState<'intro' | 'settle' | 'ready'>('intro');
  const navigate = useNavigate();

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('settle'), 2200);
    const t2 = setTimeout(() => setPhase('ready'), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleStart = () => {
    if (!tematica || !dificultad) return;
    navigate('/game', { state: { tematica, dificultad, tiempo } });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Inter:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }

        @keyframes stadiumReveal {
          0%   { opacity: 0; transform: scale(1.15) translateY(30px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes lightBeamLeft {
          0%   { opacity: 0; transform: rotate(-35deg) translateX(-200px); }
          60%  { opacity: 0.9; }
          100% { opacity: 0.55; transform: rotate(-35deg) translateX(0); }
        }
        @keyframes lightBeamRight {
          0%   { opacity: 0; transform: rotate(35deg) translateX(200px); }
          60%  { opacity: 0.9; }
          100% { opacity: 0.55; transform: rotate(35deg) translateX(0); }
        }
        @keyframes starDraw {
          0%   { stroke-dashoffset: 1200; opacity: 0; }
          30%  { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes starGlow {
          0%, 100% { filter: drop-shadow(0 0 8px #38bdf8) drop-shadow(0 0 20px #0ea5e9); }
          50%       { filter: drop-shadow(0 0 16px #7dd3fc) drop-shadow(0 0 40px #38bdf8); }
        }
        @keyframes formEnter {
          0%   { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes titleEnter {
          0%   { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes scanLine {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes particleFade {
          0%   { opacity: 0; transform: translateY(0); }
          20%  { opacity: 1; }
          100% { opacity: 0; transform: translateY(-80px); }
        }
        @keyframes pulseRing {
          0%   { transform: scale(0.95); opacity: 0.6; }
          100% { transform: scale(1.05); opacity: 0.2; }
        }
        @keyframes floorAppear {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }

        .beam-left.settled  { opacity: 0.18 !important; transition: opacity 1s ease; }
        .beam-right.settled { opacity: 0.14 !important; transition: opacity 1s ease; }

        .option-card {
          border: 1px solid rgba(56,189,248,0.15);
          background: rgba(255,255,255,0.03);
          border-radius: 10px;
          padding: 12px 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #e2e8f0;
          font-family: 'Inter', sans-serif;
        }
        .option-card:hover {
          border-color: rgba(56,189,248,0.4);
          background: rgba(56,189,248,0.05);
        }
        .option-card.selected {
          border-color: #38bdf8;
          background: rgba(56,189,248,0.1);
          box-shadow: 0 0 12px rgba(56,189,248,0.15);
        }

        .play-btn {
          background: linear-gradient(90deg, #0284c7, #38bdf8, #0284c7);
          background-size: 200% auto;
          color: #fff;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 700;
          font-size: 16px;
          letter-spacing: 3px;
          padding: 14px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          width: 100%;
          transition: background-position 0.4s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 0 20px rgba(56,189,248,0.25);
          text-transform: uppercase;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .play-btn:hover:not(:disabled) {
          background-position: right center;
          box-shadow: 0 0 30px rgba(56,189,248,0.45);
          transform: translateY(-1px);
        }
        .play-btn:disabled {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.2);
          cursor: not-allowed;
          box-shadow: none;
        }
        .play-btn:active:not(:disabled) { transform: scale(0.98); }

        .section-label {
          font-family: 'Barlow Condensed', sans-serif;
          font-size: 11px;
          letter-spacing: 3px;
          color: rgba(56,189,248,0.6);
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .lucide-icon {
          color: #38bdf8;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#020817',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif",
      }}>

        {/* Fondo */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% 100%, #0c2340 0%, #020817 70%)',
          animation: phase === 'intro' ? 'stadiumReveal 1.4s cubic-bezier(0.22,1,0.36,1) forwards' : 'none',
        }}/>
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '60%',
          background: 'radial-gradient(ellipse 70% 50% at 50% 0%, #0e2a4a 0%, transparent 100%)',
          pointerEvents: 'none',
        }}/>

        {/* Scan line */}
        {phase === 'intro' && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
            background: 'linear-gradient(90deg, transparent, #38bdf8, #7dd3fc, #38bdf8, transparent)',
            animation: 'scanLine 1.8s ease forwards',
            zIndex: 10, pointerEvents: 'none',
            boxShadow: '0 0 20px #38bdf8',
          }}/>
        )}

        {/* Estrella */}
        <svg style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -65%)',
          width: '440px', height: '440px',
          opacity: phase === 'ready' ? 0.06 : phase === 'settle' ? 0.1 : 0.18,
          transition: 'opacity 1s ease', pointerEvents: 'none',
          animation: phase !== 'intro' ? 'starGlow 4s ease-in-out infinite' : 'none',
        }} viewBox="0 0 200 200">
          <polygon points="100,10 120,70 180,70 132,108 150,170 100,133 50,170 68,108 20,70 80,70"
            fill="none" stroke="#38bdf8" strokeWidth="2.5"
            strokeDasharray="1200" strokeDashoffset="0"
            style={{ animation: 'starDraw 2s cubic-bezier(0.4,0,0.2,1) forwards', filter: 'drop-shadow(0 0 6px #38bdf8)' }}
          />
        </svg>

        {/* Haces */}
        <div className={`beam-left${phase !== 'intro' ? ' settled' : ''}`} style={{
          position: 'absolute', top: '-10%', left: '5%',
          width: '3px', height: '110%',
          background: 'linear-gradient(to bottom, rgba(56,189,248,0.9) 0%, rgba(56,189,248,0.1) 60%, transparent 100%)',
          transformOrigin: 'top center',
          animation: 'lightBeamLeft 1.6s cubic-bezier(0.22,1,0.36,1) 0.3s both',
          pointerEvents: 'none',
          boxShadow: '0 0 25px rgba(56,189,248,0.4), 0 0 60px rgba(56,189,248,0.2)',
        }}/>
        <div className={`beam-right${phase !== 'intro' ? ' settled' : ''}`} style={{
          position: 'absolute', top: '-10%', right: '5%',
          width: '3px', height: '110%',
          background: 'linear-gradient(to bottom, rgba(56,189,248,0.9) 0%, rgba(56,189,248,0.1) 60%, transparent 100%)',
          transformOrigin: 'top center',
          animation: 'lightBeamRight 1.6s cubic-bezier(0.22,1,0.36,1) 0.5s both',
          pointerEvents: 'none',
          boxShadow: '0 0 25px rgba(56,189,248,0.4), 0 0 60px rgba(56,189,248,0.2)',
        }}/>

        {/* Cancha */}
        <svg style={{
          position: 'absolute', bottom: 0, left: 0, width: '100%', height: '30%',
          opacity: phase === 'ready' ? 0.1 : phase === 'settle' ? 0.18 : 0.28,
          transition: 'opacity 1s ease', pointerEvents: 'none',
        }} viewBox="0 0 800 200" preserveAspectRatio="xMidYMax slice">
          {[...Array(9)].map((_, i) => (
            <line key={i} x1={400} y1={0} x2={i * 100} y2={200} stroke="#38bdf8" strokeWidth="0.8" opacity="0.6"/>
          ))}
          {[40, 80, 120, 160, 200].map((y, i) => (
            <line key={i} x1={0} y1={y} x2={800} y2={y} stroke="#38bdf8" strokeWidth="0.5" opacity="0.4"/>
          ))}
          <line x1={400} y1={0} x2={400} y2={200} stroke="#38bdf8" strokeWidth="1.2" opacity="0.8"/>
        </svg>

        {/* Partículas */}
        {phase === 'intro' && [...Array(12)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${10 + i * 7.5}%`,
            bottom: `${20 + (i % 4) * 15}%`,
            width: '2px', height: '2px', borderRadius: '50%',
            background: '#38bdf8',
            animation: `particleFade ${0.8 + i * 0.15}s ease ${i * 0.1}s both`,
            boxShadow: '0 0 6px #38bdf8', pointerEvents: 'none',
          }}/>
        ))}

        {/* Contenido */}
        <div style={{
          width: '100%', maxWidth: '460px',
          position: 'relative', zIndex: 2,
          animation: 'formEnter 0.7s ease 1.8s both',
        }}>

          {/* Título */}
          <div style={{ textAlign: 'center', marginBottom: '28px', animation: 'titleEnter 0.8s ease 1.5s both' }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                <CircleDot size={44} strokeWidth={1.5} />
              </div>
              <div style={{
                position: 'absolute', inset: '-8px', borderRadius: '50%',
                border: '1px solid rgba(56,189,248,0.3)',
                animation: 'pulseRing 2s ease-in-out infinite alternate',
              }}/>
            </div>
            <h1 style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '32px', fontWeight: 800,
              letterSpacing: '6px', margin: '0 0 4px',
              color: '#f0f9ff',
              textShadow: '0 0 30px rgba(56,189,248,0.4)',
              textTransform: 'uppercase',
            }}>NUEVA PARTIDA</h1>
            <p style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '11px', color: 'rgba(56,189,248,0.6)',
              letterSpacing: '4px', margin: 0, textTransform: 'uppercase',
            }}>Modo contra la IA</p>
          </div>

          {/* Card */}
          <div style={{
            background: 'rgba(10,22,50,0.85)',
            border: '1px solid rgba(56,189,248,0.15)',
            borderRadius: '16px', overflow: 'hidden',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 0 40px rgba(2,8,23,0.8), inset 0 1px 0 rgba(56,189,248,0.1)',
          }}>
            <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #38bdf8, #7dd3fc, #38bdf8, transparent)' }}/>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>

              {/* Temática */}
              <div>
                <p className="section-label">Temática</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {TEMATICAS.map(t => (
                    <div key={t.id} className={`option-card${tematica === t.id ? ' selected' : ''}`} onClick={() => setTematica(t.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="lucide-icon">{t.icon}</span>
                      <span style={{ fontSize: '13px', fontWeight: tematica === t.id ? 600 : 400 }}>{t.nombre}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dificultad */}
              <div>
                <p className="section-label">Dificultad</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {DIFICULTADES.map(d => (
                    <div key={d.id} className={`option-card${dificultad === d.id ? ' selected' : ''}`} onClick={() => setDificultad(d.id)}>
                      <div className="lucide-icon" style={{ marginBottom: '4px' }}>{d.icon}</div>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>{d.nombre}</div>
                      <div style={{ fontSize: '10px', color: 'rgba(148,163,184,0.5)', marginTop: '2px' }}>{d.descripcion}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tiempo */}
              <div>
                <p className="section-label">Tiempo por ronda</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {TIEMPOS.map(t => (
                    <div key={t.id} className={`option-card${tiempo === t.id ? ' selected' : ''}`} onClick={() => setTiempo(t.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="lucide-icon"><Timer size={14} strokeWidth={1.5} /></span>
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>{t.nombre}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botón */}
              <button className="play-btn" onClick={handleStart} disabled={!tematica || !dificultad}>
                <CircleDot size={18} strokeWidth={2} />
                ¡JUGAR!
              </button>

            </div>
          </div>

          <p onClick={() => navigate('/dashboard')} style={{
            textAlign: 'center', color: 'rgba(148,163,184,0.3)',
            fontSize: '12px', marginTop: '16px', cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
          }}>← Volver al Dashboard</p>
        </div>
      </div>
    </>
  );
}