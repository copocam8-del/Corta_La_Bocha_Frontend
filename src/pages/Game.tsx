import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const CATEGORIAS: Record<string, string[]> = {
  general: ['Jugador', 'Equipo', 'DT', 'Selección', 'Campeón Champions', 'Campeón Mundial', 'Jugador Argentino'],
  liga_argentina: ['Jugador Arg', 'Equipo Arg', 'DT Arg', 'Estadio', 'Apodo Club', 'Jugador Histórico', 'Clásico'],
  mundial: ['Jugador', 'DT', 'Selección', 'Goleador', 'País Sede', 'Selección Campeona'],
  champions: ['Jugador', 'DT', 'Equipo', 'Goleador', 'Equipo Campeón', 'Jugador Promesa', 'Clásico'],
  libertadores: ['Jugador', 'DT', 'Equipo', 'Goleador', 'Jugador Histórico', 'Equipo Campeón', 'Clásico'],
};

const IA_RESPUESTAS: Record<string, string[]> = {
  A: ['Agüero', 'Ajax', 'Ancelotti', 'Argentina', 'Abidal', 'Ayala', 'Aimar'],
  B: ['Benzema', 'Barcelona', 'Bielsa', 'Brasil', 'Busquets', 'Batistuta', 'Banega'],
  C: ['Cristiano', 'Chelsea', 'Capello', 'Colombia', 'Casillas', 'Caniggia', 'Crespo'],
  D: ['Di María', 'Dortmund', 'Del Bosque', 'Dinamarca', 'Drogba', 'D\'Alessandro', 'Díaz'],
  M: ['Messi', 'Manchester', 'Mourinho', 'México', 'Maldini', 'Maradona', 'Mascherano'],
  R: ['Ronaldo', 'Real Madrid', 'Rijkaard', 'Rumania', 'Ramos', 'Redondo', 'Riquelme'],
  S: ['Suárez', 'Sevilla', 'Scolari', 'Serbia', 'Schmeichel', 'Simeone', 'Saviola'],
  T: ['Tevez', 'Tottenham', 'Tuchel', 'Tunisia', 'Terry', 'Trezeguet', 'Tapia'],
  V: ['Vinicius', 'Valencia', 'Valdano', 'Venezuela', 'Vidal', 'Verón', 'Vargas'],
};

const LETRAS = 'ABCDEFLMNOPRSTV'.split('');
function getLetra() { return LETRAS[Math.floor(Math.random() * LETRAS.length)]; }

const DIFICULTAD_CONFIG = {
  facil:   { delay: 15000, errores: 0.4 },
  medio:   { delay: 8000,  errores: 0.2 },
  dificil: { delay: 4000,  errores: 0.1 },
  experto: { delay: 2000,  errores: 0 },
};

export default function Game() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tematica, dificultad, tiempo } = (location.state || {}) as {
    tematica: string; dificultad: string; tiempo: number;
  };

  const categorias = CATEGORIAS[tematica] || CATEGORIAS.general;
  const [letra] = useState(getLetra);
  const [timeLeft, setTimeLeft] = useState(tiempo || 60);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [iaRespuestas, setIaRespuestas] = useState<Record<string, string>>({});
  const [finished, setFinished] = useState(false);
  const [phase, setPhase] = useState<'intro' | 'settle' | 'ready'>('intro');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const iaTimeoutRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const config = DIFICULTAD_CONFIG[dificultad as keyof typeof DIFICULTAD_CONFIG] || DIFICULTAD_CONFIG.medio;

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('settle'), 2200);
    const t2 = setTimeout(() => setPhase('ready'), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    if (finished) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(intervalRef.current!); setFinished(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [finished]);

  useEffect(() => {
    if (finished) return;
    const iaPool = IA_RESPUESTAS[letra] || categorias.map(() => '---');
    categorias.forEach((cat, i) => {
      const t = setTimeout(() => {
        if (Math.random() > config.errores) {
          setIaRespuestas(prev => ({ ...prev, [cat]: iaPool[i] || '---' }));
        }
      }, config.delay + i * 1500);
      iaTimeoutRef.current.push(t);
    });
    return () => iaTimeoutRef.current.forEach(clearTimeout);
  }, [finished]);

  const handleBasta = () => {
    clearInterval(intervalRef.current!);
    iaTimeoutRef.current.forEach(clearTimeout);
    setFinished(true);
  };

  const handleChange = (cat: string, val: string) => {
    if (finished) return;
    setRespuestas(r => ({ ...r, [cat]: val }));
  };

  const timerColor = timeLeft > 30 ? '#38bdf8' : timeLeft > 10 ? '#fbbf24' : '#ef4444';

  if (!tematica) { navigate('/lobby'); return null; }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Inter:wght@300;400;500&display=swap');
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
        @keyframes fadeInUp {
          0%   { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes letterPop {
          0%   { transform: scale(0.3); opacity: 0; }
          70%  { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
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
        @keyframes timerWarn {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.08); }
        }
        @keyframes iaType {
          from { opacity: 0; transform: scale(0.8); }
          to   { opacity: 1; transform: scale(1); }
        }

        .beam-left.settled  { opacity: 0.18 !important; transition: opacity 1s ease; }
        .beam-right.settled { opacity: 0.14 !important; transition: opacity 1s ease; }

        .grid-input {
          background: transparent;
          border: none;
          color: #38bdf8;
          width: 100%;
          height: 100%;
          padding: 8px 6px;
          font-size: 12px;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 700;
          letter-spacing: 1px;
          outline: none;
          text-align: center;
          text-transform: uppercase;
        }
        .grid-input::placeholder { color: rgba(56,189,248,0.2); font-weight: 400; font-size: 11px; }
        .grid-input:focus { background: rgba(56,189,248,0.05); }
        .grid-input:disabled { opacity: 0.4; cursor: not-allowed; }

        .basta-btn {
          background: linear-gradient(90deg, #dc2626, #ef4444, #dc2626);
          background-size: 200% auto;
          color: #fff;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 800;
          font-size: 20px;
          letter-spacing: 4px;
          padding: 16px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          width: 100%;
          transition: all 0.2s ease;
          box-shadow: 0 0 30px rgba(239,68,68,0.3);
          text-transform: uppercase;
        }
        .basta-btn:hover:not(:disabled) {
          background-position: right center;
          box-shadow: 0 0 45px rgba(239,68,68,0.5);
          transform: translateY(-2px);
        }
        .basta-btn:disabled {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.2);
          cursor: not-allowed;
          box-shadow: none;
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: '#020817',
        fontFamily: "'Inter', sans-serif",
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px',
        gap: '12px',
      }}>

        {/* Fondo */}
        <div style={{
          position: 'fixed', inset: 0,
          background: 'radial-gradient(ellipse 80% 60% at 50% 100%, #0c2340 0%, #020817 70%)',
          animation: phase === 'intro' ? 'stadiumReveal 1.4s cubic-bezier(0.22,1,0.36,1) forwards' : 'none',
          pointerEvents: 'none',
        }}/>
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: '60%',
          background: 'radial-gradient(ellipse 70% 50% at 50% 0%, #0e2a4a 0%, transparent 100%)',
          pointerEvents: 'none',
        }}/>

        {/* Scan line */}
        {phase === 'intro' && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, height: '2px',
            background: 'linear-gradient(90deg, transparent, #38bdf8, #7dd3fc, #38bdf8, transparent)',
            animation: 'scanLine 1.8s ease forwards',
            zIndex: 10, pointerEvents: 'none',
            boxShadow: '0 0 20px #38bdf8',
          }}/>
        )}

        {/* Estrella */}
        <svg style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -65%)',
          width: '440px', height: '440px',
          opacity: phase === 'ready' ? 0.04 : phase === 'settle' ? 0.07 : 0.15,
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
          position: 'fixed', top: '-10%', left: '5%',
          width: '3px', height: '110%',
          background: 'linear-gradient(to bottom, rgba(56,189,248,0.9) 0%, rgba(56,189,248,0.1) 60%, transparent 100%)',
          transformOrigin: 'top center',
          animation: 'lightBeamLeft 1.6s cubic-bezier(0.22,1,0.36,1) 0.3s both',
          pointerEvents: 'none',
          boxShadow: '0 0 25px rgba(56,189,248,0.4)',
        }}/>
        <div className={`beam-right${phase !== 'intro' ? ' settled' : ''}`} style={{
          position: 'fixed', top: '-10%', right: '5%',
          width: '3px', height: '110%',
          background: 'linear-gradient(to bottom, rgba(56,189,248,0.9) 0%, rgba(56,189,248,0.1) 60%, transparent 100%)',
          transformOrigin: 'top center',
          animation: 'lightBeamRight 1.6s cubic-bezier(0.22,1,0.36,1) 0.5s both',
          pointerEvents: 'none',
          boxShadow: '0 0 25px rgba(56,189,248,0.4)',
        }}/>

        {/* Cancha */}
        <svg style={{
          position: 'fixed', bottom: 0, left: 0, width: '100%', height: '25%',
          opacity: phase === 'ready' ? 0.06 : 0.15,
          transition: 'opacity 1s ease', pointerEvents: 'none',
        }} viewBox="0 0 800 200" preserveAspectRatio="xMidYMax slice">
          {[...Array(9)].map((_, i) => (
            <line key={i} x1={400} y1={0} x2={i * 100} y2={200} stroke="#38bdf8" strokeWidth="0.8" opacity="0.6"/>
          ))}
          {[40, 80, 120, 160, 200].map((y, i) => (
            <line key={i} x1={0} y1={y} x2={800} y2={y} stroke="#38bdf8" strokeWidth="0.5" opacity="0.4"/>
          ))}
        </svg>

        {/* Partículas */}
        {phase === 'intro' && [...Array(12)].map((_, i) => (
          <div key={i} style={{
            position: 'fixed',
            left: `${10 + i * 7.5}%`, bottom: `${20 + (i % 4) * 15}%`,
            width: '2px', height: '2px', borderRadius: '50%',
            background: '#38bdf8',
            animation: `particleFade ${0.8 + i * 0.15}s ease ${i * 0.1}s both`,
            boxShadow: '0 0 6px #38bdf8', pointerEvents: 'none',
          }}/>
        ))}

        {/* Contenido */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            animation: 'fadeInUp 0.5s ease 1.8s both',
          }}>
            <div>
              <p style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '11px', letterSpacing: '3px',
                color: 'rgba(56,189,248,0.5)', textTransform: 'uppercase', margin: 0,
              }}>Modo IA · {dificultad}</p>
              <p style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0',
                textTransform: 'uppercase', letterSpacing: '1px',
              }}>{tematica.replace('_', ' ')}</p>
            </div>

            {/* Letra */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              animation: 'letterPop 0.6s cubic-bezier(0.34,1.56,0.64,1) 2s both',
            }}>
              <div style={{
                width: '64px', height: '64px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(10,22,50,0.9)',
                border: '2px solid rgba(56,189,248,0.5)',
                borderRadius: '12px',
                boxShadow: '0 0 20px rgba(56,189,248,0.25), inset 0 1px 0 rgba(56,189,248,0.1)',
              }}>
                <span style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: '48px', fontWeight: 900, color: '#f0f9ff',
                  textShadow: '0 0 20px rgba(56,189,248,0.8)', lineHeight: 1,
                }}>{letra}</span>
              </div>
              <p style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '9px', letterSpacing: '2px',
                color: 'rgba(56,189,248,0.4)', marginTop: '3px', textTransform: 'uppercase',
              }}>Letra</p>
            </div>

            {/* Timer */}
            <div style={{ textAlign: 'right' }}>
              <p style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '11px', letterSpacing: '2px',
                color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', margin: 0,
              }}>Tiempo</p>
              <p style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '38px', fontWeight: 900, margin: 0, lineHeight: 1,
                color: timerColor,
                animation: timeLeft <= 10 ? 'timerWarn 0.5s ease infinite' : 'none',
                textShadow: `0 0 20px ${timerColor}`,
              }}>{timeLeft}</p>
              <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: '10px', color: 'rgba(255,255,255,0.3)', margin: 0 }}>seg</p>
            </div>
          </div>

          {/* Timer bar */}
          <div style={{ height: '2px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '2px',
              width: `${((tiempo - timeLeft) / tiempo) * 100}%`,
              background: timerColor,
              transition: 'width 1s linear, background 0.5s ease',
              boxShadow: `0 0 8px ${timerColor}`,
            }}/>
          </div>

          {/* GRILLA */}
          <div style={{
            overflowX: 'auto',
            animation: 'fadeInUp 0.6s ease 2s both',
          }}>
            <div style={{
              minWidth: `${80 + categorias.length * 120}px`,
              background: 'rgba(10,22,50,0.85)',
              border: '1px solid rgba(56,189,248,0.15)',
              borderRadius: '16px',
              overflow: 'hidden',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 0 40px rgba(2,8,23,0.8), inset 0 1px 0 rgba(56,189,248,0.1)',
            }}>
              <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #38bdf8, #7dd3fc, #38bdf8, transparent)' }}/>

              {/* Headers */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: `70px repeat(${categorias.length}, 1fr)`,
                borderBottom: '1px solid rgba(56,189,248,0.2)',
                background: 'rgba(56,189,248,0.04)',
              }}>
                <div style={{ padding: '10px 8px', borderRight: '1px solid rgba(56,189,248,0.1)' }}/>
                {categorias.map((cat, i) => (
                  <div key={cat} style={{
                    padding: '10px 6px',
                    borderRight: i < categorias.length - 1 ? '1px solid rgba(56,189,248,0.1)' : 'none',
                    textAlign: 'center',
                  }}>
                    <span style={{
                      fontFamily: "'Barlow Condensed', sans-serif",
                      fontSize: '10px', fontWeight: 700,
                      color: 'rgba(56,189,248,0.8)', letterSpacing: '1px',
                      textTransform: 'uppercase', lineHeight: 1.2,
                      display: 'block',
                    }}>{cat}</span>
                  </div>
                ))}
              </div>

              {/* Fila VOS */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: `70px repeat(${categorias.length}, 1fr)`,
                borderBottom: '1px solid rgba(56,189,248,0.1)',
              }}>
                <div style={{
                  padding: '12px 8px', borderRight: '1px solid rgba(56,189,248,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: '12px', fontWeight: 700,
                    color: '#38bdf8', letterSpacing: '1px',
                  }}>VOS</span>
                </div>
                {categorias.map((cat, i) => (
                  <div key={cat} style={{
                    borderRight: i < categorias.length - 1 ? '1px solid rgba(56,189,248,0.1)' : 'none',
                    height: '48px', display: 'flex', alignItems: 'center',
                  }}>
                    <input
                      className="grid-input"
                      placeholder={`${letra}...`}
                      value={respuestas[cat] || ''}
                      onChange={e => handleChange(cat, e.target.value)}
                      disabled={finished}
                    />
                  </div>
                ))}
              </div>

              {/* Fila IA */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: `70px repeat(${categorias.length}, 1fr)`,
                background: 'rgba(239,68,68,0.03)',
              }}>
                <div style={{
                  padding: '12px 8px', borderRight: '1px solid rgba(56,189,248,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: '12px', fontWeight: 700,
                    color: '#ef4444', letterSpacing: '1px',
                  }}>IA 🤖</span>
                </div>
                {categorias.map((cat, i) => (
                  <div key={cat} style={{
                    borderRight: i < categorias.length - 1 ? '1px solid rgba(56,189,248,0.1)' : 'none',
                    height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '6px',
                  }}>
                    {iaRespuestas[cat] ? (
                      <span style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: '12px', fontWeight: 700,
                        color: '#ef4444', textTransform: 'uppercase',
                        animation: 'iaType 0.3s ease forwards',
                      }}>{iaRespuestas[cat]}</span>
                    ) : (
                      <span style={{ fontSize: '14px', opacity: 0.4 }}>{finished ? '' : '⌛'}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Botón BASTA */}
          <button className="basta-btn" onClick={handleBasta} disabled={finished}
            style={{ animation: 'fadeInUp 0.6s ease 2.2s both' }}>
            🛑 ¡BASTA!
          </button>

          {/* Resultado */}
          {finished && (
            <div style={{
              background: 'rgba(10,22,50,0.9)',
              border: '1px solid rgba(56,189,248,0.2)',
              borderRadius: '12px', padding: '20px',
              textAlign: 'center',
              animation: 'fadeInUp 0.4s ease forwards',
              backdropFilter: 'blur(16px)',
            }}>
              <p style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '24px', fontWeight: 800,
                color: '#f0f9ff', letterSpacing: '2px', margin: '0 0 8px',
              }}>⏱️ ¡TIEMPO!</p>
              <p style={{ color: 'rgba(148,163,184,0.5)', fontSize: '13px', margin: '0 0 16px' }}>
                Próximamente verás los resultados y puntaje aquí
              </p>
              <button onClick={() => navigate('/lobby')} style={{
                background: 'linear-gradient(90deg, #0284c7, #38bdf8)',
                color: '#fff', border: 'none', borderRadius: '8px',
                padding: '12px 28px', cursor: 'pointer',
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: '15px', fontWeight: 800, letterSpacing: '2px',
              }}>
                VOLVER AL LOBBY
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}