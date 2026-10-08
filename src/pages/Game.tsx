import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bot, PenLine, Hourglass, StopCircle, Timer, Trophy, Handshake, Skull, Flame } from 'lucide-react';
import { finishQuickMatch, startQuickMatch, type QuickMatch, type QuickMatchResult } from '../api/soloMatch';

// La partida se decide en el servidor: él sortea la letra, arma las respuestas de la máquina
// (según la dificultad) y al final valida tus respuestas, calcula el resultado y actualiza
// tus estadísticas. Acá sólo se muestra el juego.

export default function Game() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tematica, dificultad, tiempo: tiempoElegido } = (location.state || {}) as {
    tematica: string; dificultad: string; tiempo: number;
  };
  const tiempo = tiempoElegido || 60;

  const [match, setMatch] = useState<QuickMatch | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(tiempo);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [iaRespuestas, setIaRespuestas] = useState<Record<string, string>>({});
  const iaBuildRef = useRef<Record<string, string>>({});
  const [finished, setFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<QuickMatchResult | null>(null);
  const [entered, setEntered] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const iaTimeoutRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const startedRef = useRef(false);

  const letra = match?.letter ?? '';
  const categorias = match?.categories ?? [];

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
    const t = setTimeout(() => setEntered(true), 80);
    return () => clearTimeout(t);
  }, []);

  // 1) Pedirle la partida al servidor (una sola vez, aunque React monte dos veces en desarrollo)
  useEffect(() => {
    if (!tematica || startedRef.current) return;
    startedRef.current = true;
    startQuickMatch({ tematica, dificultad, tiempo })
      .then(setMatch)
      .catch(() => setStartError('No se pudo empezar la partida. Revisá tu conexión y probá de nuevo.'));
  }, [tematica, dificultad, tiempo]);

  // 2) Cronómetro: arranca cuando llega la partida
  useEffect(() => {
    if (!match || finished) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current!);
          iaTimeoutRef.current.forEach(clearTimeout);
          setIaRespuestas({ ...iaBuildRef.current });
          setFinished(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [match, finished]);

  // 3) La máquina "escribe" según el plan que mandó el servidor
  useEffect(() => {
    if (!match || finished) return;
    const timeouts = match.aiPlan
      .filter(item => item.answer)
      .map(item => setTimeout(() => {
        iaBuildRef.current = { ...iaBuildRef.current, [item.category]: item.answer! };
      }, item.delayMs));
    iaTimeoutRef.current = timeouts;
    return () => timeouts.forEach(clearTimeout);
  }, [match, finished]);

  const handleBasta = () => {
    clearInterval(intervalRef.current!);
    iaTimeoutRef.current.forEach(clearTimeout);
    setIaRespuestas({ ...iaBuildRef.current });
    setFinished(true);
  };

  // 4) Al terminar, el servidor valida y decide el resultado oficial
  const enviarResultado = useCallback(() => {
    if (!match) return;
    setIsLoading(true);
    setApiError(null);
    finishQuickMatch(
      match.matchId,
      match.categories.map(cat => ({ category: cat, answer: respuestas[cat]?.trim() || null })),
    )
      .then(res => {
        setResultado(res);
        // Las respuestas de la máquina que cuentan son las que calculó el servidor
        setIaRespuestas(res.aiAnswers);
      })
      .catch(err => {
        const status = err?.response?.status;
        setApiError(status === 409
          ? 'Esta partida ya se había terminado.'
          : 'No se pudo conectar con el servidor. Probá de nuevo.');
      })
      .finally(() => setIsLoading(false));
  }, [match, respuestas]);

  const sentRef = useRef(false);
  useEffect(() => {
    if (!finished || sentRef.current) return;
    sentRef.current = true;
    enviarResultado();
  }, [finished, enviarResultado]);

  const handleChange = (cat: string, val: string) => {
    if (finished) return;
    setRespuestas(r => ({ ...r, [cat]: val }));
  };

  const timerPct = ((tiempo - timeLeft) / tiempo) * 100;
  const timerColor = timeLeft > 30 ? '#39ff8c' : timeLeft > 10 ? '#fbbf24' : '#ef4444';

  if (!tematica) { navigate('/lobby'); return null; }

  if (!match) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '14px', padding: '24px', background: '#010805', color: '#ecfff3', fontFamily: "'Inter', sans-serif",
        textAlign: 'center',
      }}>
        {startError ? (
          <>
            <p style={{ color: '#fca5a5', fontSize: '14px' }}>{startError}</p>
            <button onClick={() => navigate('/lobby')} style={{
              background: 'linear-gradient(135deg, #0fae5d, #39ff8c)', color: '#04210f', border: 'none',
              borderRadius: '8px', padding: '10px 22px', fontWeight: 700, cursor: 'pointer',
            }}>Volver al Lobby</button>
          </>
        ) : (
          <p style={{ color: 'rgba(180,255,205,0.75)', fontSize: '14px' }}>Preparando la partida...</p>
        )}
      </div>
    );
  }

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
        @keyframes titleGlow {
          0%, 100% { text-shadow: 0 0 16px rgba(57,255,140,0.5), 0 0 36px rgba(57,255,140,0.2); }
          50%      { text-shadow: 0 0 28px rgba(57,255,140,0.85), 0 0 60px rgba(57,255,140,0.4); }
        }
        @keyframes letterPop {
          0%   { transform: scale(0.3); opacity: 0; }
          70%  { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes riseIn {
          0%   { opacity: 0; transform: translateY(22px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes timerWarn {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.12); }
        }
        @keyframes iaType {
          from { opacity: 0; transform: scale(0.8); }
          to   { opacity: 1; transform: scale(1); }
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

        .grid-input {
          background: transparent;
          border: none;
          color: #39ff8c;
          width: 100%;
          height: 100%;
          padding: 6px 4px;
          font-size: 11px;
          font-family: 'Oswald', sans-serif;
          font-weight: 600;
          letter-spacing: 1.5px;
          outline: none;
          text-align: center;
          text-transform: uppercase;
        }
        .grid-input::placeholder { color: rgba(57,255,140,0.2); font-weight: 500; font-size: 10px; }
        .grid-input:focus { background: rgba(57,255,140,0.04); }
        .grid-input:disabled { opacity: 0.35; cursor: not-allowed; }

        .basta-btn {
          background: linear-gradient(135deg, #0fae5d, #39ff8c);
          color: #04210f;
          font-family: 'Oswald', sans-serif;
          font-weight: 700;
          font-size: 16px;
          letter-spacing: 4px;
          padding: 13px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          width: 100%;
          transition: all 0.2s ease;
          box-shadow: 0 0 24px rgba(57,255,140,0.35);
          text-transform: uppercase;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .basta-btn:hover:not(:disabled) {
          filter: brightness(1.1);
          box-shadow: 0 0 40px rgba(57,255,140,0.55);
          transform: translateY(-1px);
        }
        .basta-btn:disabled {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.2);
          cursor: not-allowed;
          box-shadow: none;
        }
        .spinner {
          width: 36px; height: 36px; border-radius: 50%;
          border: 3px solid rgba(57,255,140,0.15);
          border-top-color: #39ff8c;
          animation: spin 1s linear infinite;
          margin: 8px auto;
        }
        .result-item {
          display: flex; justify-content: space-between; gap: 12px;
          padding: 8px 12px; border-radius: 8px;
          background: rgba(57,255,140,0.03);
          border: 1px solid rgba(57,255,140,0.08);
          margin: 6px 0;
        }
        .result-item .cat {
          font-family: 'Oswald', sans-serif;
          color: #7CFFB2; font-weight: 600; font-size: 13px; letter-spacing: 1px;
        }
        .result-item .score {
          font-family: 'Oswald', sans-serif;
          color: #eafff2; font-weight: 700; font-size: 14px;
        }
        .result-reason { color: rgba(124,255,178,0.5); font-size: 11px; margin-top: 4px; }

        .game-card {
          animation: neonPulse 4s ease-in-out infinite;
        }
      `}</style>

      {/* FONDO — cancha idéntica al Lobby */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden' }}>
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
            background: 'radial-gradient(ellipse 70% 70% at 50% 48%, transparent 35%, rgba(0,4,2,0.82) 100%)',
          }}/>
        </div>

        {/* motas flotantes */}
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
          width: '100%', maxWidth: '860px',
          display: 'flex', flexDirection: 'column', gap: '12px',
          opacity: entered ? 1 : 0,
          animation: entered ? 'riseIn 0.6s ease both' : 'none',
          paddingTop: '8px',
        }}>

          {/* HEADER */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Meta */}
            <div>
              <p style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: '10px', letterSpacing: '3px',
                color: 'rgba(57,255,140,0.55)', textTransform: 'uppercase', margin: 0,
              }}>Modo IA · {dificultad}</p>
              <p style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: '13px', color: 'rgba(255,255,255,0.4)',
                margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '1px',
              }}>{tematica.replace('_', ' ')}</p>
            </div>

            {/* Letra */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              animation: entered ? 'letterPop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.3s both' : 'none',
            }}>
              <div style={{
                width: '62px', height: '62px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(4,20,11,0.85)',
                border: '2px solid rgba(57,255,140,0.55)',
                borderRadius: '12px',
                boxShadow: '0 0 24px rgba(57,255,140,0.2), inset 0 1px 0 rgba(57,255,140,0.1)',
              }}>
                <span style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: '44px', fontWeight: 700, color: '#eafff2',
                  textShadow: '0 0 20px rgba(57,255,140,0.8)', lineHeight: 1,
                  animation: 'titleGlow 2.6s ease-in-out infinite',
                }}>{letra}</span>
              </div>
              <p style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: '8px', letterSpacing: '2px',
                color: 'rgba(57,255,140,0.45)', marginTop: '3px', textTransform: 'uppercase',
              }}>Letra</p>
            </div>

            {/* Timer */}
            <div style={{ textAlign: 'right' }}>
              <p style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: '10px', letterSpacing: '2px',
                color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', margin: 0,
              }}>Tiempo</p>
              <p style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: '38px', fontWeight: 700, margin: 0, lineHeight: 1,
                color: timerColor,
                animation: timeLeft <= 10 ? 'timerWarn 0.5s ease infinite' : 'none',
                textShadow: `0 0 18px ${timerColor}`,
              }}>{timeLeft}</p>
              <p style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: '9px', color: 'rgba(255,255,255,0.25)', margin: 0,
              }}>seg</p>
            </div>
          </div>

          {/* Barra de tiempo */}
          <div style={{ height: '3px', background: 'rgba(57,255,140,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${timerPct}%`,
              background: timerColor,
              transition: 'width 1s linear, background 0.5s ease',
              boxShadow: `0 0 8px ${timerColor}`,
              borderRadius: '2px',
            }}/>
          </div>

          {/* GRILLA */}
          <div style={{ overflowX: 'auto' }}>
            <div className="game-card" style={{
              minWidth: `${60 + categorias.length * 105}px`,
              background: 'rgba(4,20,11,0.72)',
              border: '1px solid rgba(57,255,140,0.25)',
              borderTop: '2px solid rgba(57,255,140,0.6)',
              borderRadius: '14px', overflow: 'hidden',
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
              boxShadow: '0 30px 60px -20px rgba(0,0,0,0.75)',
            }}>
              {/* Headers */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: `62px repeat(${categorias.length}, 1fr)`,
                borderBottom: '1px solid rgba(57,255,140,0.15)',
                background: 'rgba(57,255,140,0.03)',
              }}>
                <div style={{ padding: '10px', borderRight: '1px solid rgba(57,255,140,0.1)' }}/>
                {categorias.map((cat, i) => (
                  <div key={cat} style={{
                    padding: '10px 4px',
                    borderRight: i < categorias.length - 1 ? '1px solid rgba(57,255,140,0.1)' : 'none',
                    textAlign: 'center',
                  }}>
                    <span style={{
                      fontFamily: "'Oswald', sans-serif",
                      fontSize: '9px', fontWeight: 600,
                      color: 'rgba(124,255,178,0.7)', letterSpacing: '1.5px',
                      textTransform: 'uppercase', lineHeight: 1.2, display: 'block',
                    }}>{cat}</span>
                  </div>
                ))}
              </div>

              {/* Fila VOS */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: `62px repeat(${categorias.length}, 1fr)`,
                borderBottom: '1px solid rgba(57,255,140,0.08)',
              }}>
                <div style={{
                  padding: '0 8px', borderRight: '1px solid rgba(57,255,140,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: '12px', fontWeight: 700, color: '#39ff8c', letterSpacing: '1.5px',
                  }}>VOS</span>
                </div>
                {categorias.map((cat, i) => (
                  <div key={cat} style={{
                    borderRight: i < categorias.length - 1 ? '1px solid rgba(57,255,140,0.08)' : 'none',
                    height: '42px', display: 'flex', alignItems: 'center',
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
                gridTemplateColumns: `62px repeat(${categorias.length}, 1fr)`,
                background: 'rgba(239,68,68,0.02)',
              }}>
                <div style={{
                  padding: '0 8px', borderRight: '1px solid rgba(57,255,140,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                }}>
                  <Bot size={12} strokeWidth={1.5} color="#ef4444" />
                  <span style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: '12px', fontWeight: 700, color: '#ef4444', letterSpacing: '1.5px',
                  }}>IA</span>
                </div>
                {categorias.map((cat, i) => (
                  <div key={cat} style={{
                    borderRight: i < categorias.length - 1 ? '1px solid rgba(57,255,140,0.08)' : 'none',
                    height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '4px',
                  }}>
                    {finished ? (
                      iaRespuestas[cat] ? (
                        <span style={{
                          fontFamily: "'Oswald', sans-serif",
                          fontSize: '11px', fontWeight: 600,
                          color: '#ef4444', textTransform: 'uppercase',
                          animation: 'iaType 0.4s ease forwards',
                          letterSpacing: '1px',
                        }}>{iaRespuestas[cat]}</span>
                      ) : (
                        <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>—</span>
                      )
                    ) : (
                      iaRespuestas[cat]
                        ? <PenLine size={14} strokeWidth={1.5} color="rgba(57,255,140,0.6)" />
                        : <Hourglass size={12} strokeWidth={1.5} color="rgba(255,255,255,0.3)" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BASTA */}
          <button className="basta-btn" onClick={handleBasta} disabled={finished}>
            <StopCircle size={18} strokeWidth={2} />
            ¡BASTA!
          </button>

          {/* RESULTADO */}
          {finished && (() => {
            const puntajeJugador = resultado?.playerPoints ?? 0;
            const puntajeIA = resultado?.aiPoints ?? 0;
            const gano = resultado?.outcome === 'win';
            const empate = !resultado || resultado.outcome === 'draw';

            const resultColor = gano ? '#39ff8c' : empate ? '#fbbf24' : '#ef4444';
            const resultBorder = gano ? 'rgba(57,255,140,0.35)' : empate ? 'rgba(251,191,36,0.35)' : 'rgba(239,68,68,0.35)';

            return (
              <div style={{
                background: 'rgba(4,20,11,0.82)',
                border: `1px solid ${resultBorder}`,
                borderTop: `2px solid ${resultColor}`,
                borderRadius: '14px', padding: '20px',
                textAlign: 'center',
                animation: 'fadeInUp 0.4s ease forwards',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                boxShadow: '0 30px 60px -20px rgba(0,0,0,0.75)',
              }}>
                {/* ¡TIEMPO! */}
                <div style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: '20px', fontWeight: 700,
                  color: '#eafff2', letterSpacing: '3px', margin: '0 0 12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  textTransform: 'uppercase',
                }}>
                  <Timer size={20} strokeWidth={2} color="#39ff8c" />
                  ¡Tiempo!
                </div>

                {/* Marcador */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '20px', marginBottom: '14px',
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontFamily: "'Oswald', sans-serif", fontSize: '10px',
                      color: '#39ff8c', letterSpacing: '2px', marginBottom: '4px',
                    }}>VOS</div>
                    <div style={{
                      fontFamily: "'Oswald', sans-serif", fontSize: '44px', fontWeight: 700,
                      color: '#39ff8c', lineHeight: 1,
                      textShadow: '0 0 20px rgba(57,255,140,0.6)',
                    }}>{isLoading ? '...' : puntajeJugador}</div>
                  </div>
                  <div style={{
                    fontFamily: "'Oswald', sans-serif", fontSize: '18px',
                    color: 'rgba(255,255,255,0.2)', fontWeight: 600,
                  }}>VS</div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontFamily: "'Oswald', sans-serif", fontSize: '10px', color: '#ef4444',
                      letterSpacing: '2px', marginBottom: '4px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                    }}>
                      <Bot size={12} strokeWidth={1.5} /> IA
                    </div>
                    <div style={{
                      fontFamily: "'Oswald', sans-serif", fontSize: '44px', fontWeight: 700,
                      color: '#ef4444', lineHeight: 1,
                      textShadow: '0 0 20px rgba(239,68,68,0.5)',
                    }}>{isLoading ? '...' : puntajeIA}</div>
                  </div>
                </div>

                {/* Badge resultado (sólo cuando el servidor respondió) */}
                {resultado && <div style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: '17px', fontWeight: 700, letterSpacing: '3px',
                  color: resultColor,
                  marginBottom: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  textTransform: 'uppercase',
                  textShadow: `0 0 16px ${resultColor}`,
                }}>
                  {gano
                    ? <><Trophy size={20} strokeWidth={2} /> ¡Ganaste!</>
                    : empate
                    ? <><Handshake size={20} strokeWidth={2} /> ¡Empate!</>
                    : <><Skull size={20} strokeWidth={2} /> Perdiste</>
                  }
                </div>}

                {resultado && resultado.stats.currentStreak > 1 && (
                  <p style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    color: '#fdba74', fontSize: '13px', margin: '-6px 0 14px',
                  }}>
                    <Flame size={15} /> ¡Racha de {resultado.stats.currentStreak} victorias!
                  </p>
                )}

                {/* Detalle por categoría */}
                <div style={{ minHeight: 40, marginBottom: '14px', textAlign: 'left' }}>
                  {isLoading ? (
                    <div className="spinner" />
                  ) : apiError ? (
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ color: 'rgba(239,68,68,0.9)', fontSize: '13px', margin: '0 0 10px' }}>{apiError}</p>
                      <button onClick={enviarResultado} style={{
                        background: 'transparent', color: '#7CFFB2', border: '1px solid rgba(57,255,140,0.4)',
                        borderRadius: '8px', padding: '7px 16px', cursor: 'pointer', fontSize: '12px',
                      }}>Reintentar</button>
                    </div>
                  ) : resultado?.results ? (
                    resultado.results.map((item) => (
                      <div key={item.category} className="result-item">
                        <div>
                          <div className="cat">{item.category}: <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>{item.userAnswer || '—'}</span></div>
                          {item.reason && <div className="result-reason">{item.reason}</div>}
                        </div>
                        <div className="score" style={{ color: item.points > 0 ? '#39ff8c' : 'rgba(255,255,255,0.25)' }}>
                          +{item.points}
                        </div>
                      </div>
                    ))
                  ) : null}
                </div>

                {/* Volver */}
                <button onClick={() => navigate('/lobby')} style={{
                  background: 'linear-gradient(135deg, #0fae5d, #39ff8c)',
                  color: '#04210f', border: 'none', borderRadius: '8px',
                  padding: '11px 28px', cursor: 'pointer',
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: '14px', fontWeight: 700, letterSpacing: '2px',
                  textTransform: 'uppercase',
                  boxShadow: '0 0 18px rgba(57,255,140,0.4)',
                  transition: 'all 0.2s ease',
                }}>
                  Volver al Lobby
                </button>
              </div>
            );
          })()}
        </div>
      </div>
    </>
  );
}