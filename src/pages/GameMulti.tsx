import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { StopCircle, Timer, Trophy, Medal, Users } from 'lucide-react';

const CATEGORIAS: Record<string, string[]> = {
  general:        ['Jugador', 'Equipo', 'DT', 'Selección', 'Campeón Champions', 'Campeón Mundial', 'Jugador Argentino'],
  liga_argentina: ['Jugador Arg', 'Equipo Arg', 'DT Arg', 'Estadio', 'Apodo Club', 'Jugador Histórico', 'Clásico'],
  mundial:        ['Jugador', 'DT', 'Selección', 'Goleador', 'País Sede', 'Selección Campeona'],
  champions:      ['Jugador', 'DT', 'Equipo', 'Goleador', 'Equipo Campeón', 'Jugador Promesa', 'Clásico'],
  libertadores:   ['Jugador', 'DT', 'Equipo', 'Goleador', 'Jugador Histórico', 'Equipo Campeón', 'Clásico'],
};

const LETRAS = 'ABCDEFLMNOPRSTV'.split('');
function getLetra() { return LETRAS[Math.floor(Math.random() * LETRAS.length)]; }

// Mock: respuestas de otros jugadores (se revelan al terminar)
function mockOtherAnswers(categorias: string[], letra: string, players: any[]) {
  const pool: Record<string, string[]> = {
    A: ['Agüero', 'Ajax', 'Ancelotti', 'Argentina', 'Abidal', 'Ayala', 'Aimar'],
    B: ['Benzema', 'Barcelona', 'Bielsa', 'Brasil', 'Busquets', 'Batistuta', 'Banega'],
    C: ['Cristiano', 'Chelsea', 'Capello', 'Colombia', 'Casillas', 'Caniggia', 'Crespo'],
    D: ['Di María', 'Dortmund', 'Del Bosque', 'Dinamarca', 'Drogba', "D'Alessandro", 'Díaz'],
    M: ['Messi', 'Manchester', 'Mourinho', 'México', 'Maldini', 'Maradona', 'Mascherano'],
    R: ['Ronaldo', 'Real Madrid', 'Rijkaard', 'Rumania', 'Ramos', 'Redondo', 'Riquelme'],
    S: ['Suárez', 'Sevilla', 'Scolari', 'Serbia', 'Schmeichel', 'Simeone', 'Saviola'],
    T: ['Tevez', 'Tottenham', 'Tuchel', 'Tunisia', 'Terry', 'Trezeguet', 'Tapia'],
    V: ['Vinicius', 'Valencia', 'Valdano', 'Venezuela', 'Vidal', 'Verón', 'Vargas'],
  };
  const answers = pool[letra] || categorias.map(() => '');
  return players.filter(p => !p.isHost).map(p => ({
    ...p,
    respuestas: Object.fromEntries(
      categorias.map((cat, i) => [cat, Math.random() > 0.25 ? answers[i] || '' : ''])
    ),
    points: 0,
  }));
}

export default function GameMulti() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { tematica, dificultad, tiempo, players, code, isHost } = (location.state || {}) as {
    tematica: string; dificultad: string; tiempo: number;
    players: any[]; code: string; isHost: boolean;
  };

  const categorias = CATEGORIAS[tematica] || CATEGORIAS.general;
  const [letra]    = useState(getLetra);
  const [timeLeft, setTimeLeft] = useState(tiempo || 60);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [finished,  setFinished]  = useState(false);
  const [entered,   setEntered]   = useState(false);
  const [scoreboard, setScoreboard] = useState<any[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sentRef     = useRef(false);

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

  useEffect(() => {
    if (finished) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current!);
          setFinished(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [finished]);

  // Al terminar, calcula puntajes (mock)
  useEffect(() => {
    if (!finished || sentRef.current) return;
    sentRef.current = true;

    const otherPlayers = mockOtherAnswers(categorias, letra, players || []);

    // Puntaje del jugador actual
    const myPoints = categorias.reduce((acc, cat) => {
      const val = (respuestas[cat] || '').trim();
      if (!val) return acc;
      const isDuplicate = otherPlayers.some(
        p => (p.respuestas[cat] || '').trim().toLowerCase() === val.toLowerCase()
      );
      return acc + (isDuplicate ? 5 : 10);
    }, 0);

    const me = { id: 'me', name: 'Vos', isHost: true, points: myPoints };
    const others = otherPlayers.map(p => ({
      ...p,
      points: categorias.reduce((acc, cat) => {
        const val = (p.respuestas[cat] || '').trim();
        if (!val) return acc;
        return acc + (Math.random() > 0.3 ? 10 : 5);
      }, 0),
    }));

    const all = [me, ...others].sort((a, b) => b.points - a.points);
    setScoreboard(all);
  }, [finished]);

  const handleBasta = () => {
    clearInterval(intervalRef.current!);
    setFinished(true);
  };

  const handleChange = (cat: string, val: string) => {
    if (finished) return;
    setRespuestas(r => ({ ...r, [cat]: val }));
  };

  const timerPct   = ((tiempo - timeLeft) / tiempo) * 100;
  const timerColor = timeLeft > 30 ? '#39ff8c' : timeLeft > 10 ? '#fbbf24' : '#ef4444';

  if (!tematica) { navigate('/lobby'); return null; }

  const medalColor = (i: number) =>
    i === 0 ? '#fbbf24' : i === 1 ? '#cbd5e1' : i === 2 ? '#b45309' : 'rgba(124,255,178,0.5)';

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
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes letterPop {
          0%   { transform: scale(0.3); opacity: 0; }
          70%  { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes titleGlow {
          0%, 100% { text-shadow: 0 0 16px rgba(57,255,140,0.5), 0 0 36px rgba(57,255,140,0.2); }
          50%      { text-shadow: 0 0 28px rgba(57,255,140,0.85), 0 0 60px rgba(57,255,140,0.4); }
        }
        @keyframes timerWarn {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.12); }
        }
        @keyframes drift {
          0%   { transform: translate(0,0); opacity: 0; }
          15%  { opacity: 0.9; }
          100% { transform: translate(var(--dx),-160px); opacity: 0; }
        }
        @keyframes scoreIn {
          0%   { opacity: 0; transform: translateX(-12px); }
          100% { opacity: 1; transform: translateX(0); }
        }

        .grid-input {
          background: transparent; border: none;
          color: #39ff8c; width: 100%; height: 100%;
          padding: 6px 4px; font-size: 11px;
          font-family: 'Oswald', sans-serif; font-weight: 600;
          letter-spacing: 1.5px; outline: none;
          text-align: center; text-transform: uppercase;
        }
        .grid-input::placeholder { color: rgba(57,255,140,0.2); font-weight: 500; font-size: 10px; }
        .grid-input:focus { background: rgba(57,255,140,0.04); }
        .grid-input:disabled { opacity: 0.35; cursor: not-allowed; }

        .basta-btn {
          background: linear-gradient(135deg, #0fae5d, #39ff8c);
          color: #04210f; font-family: 'Oswald', sans-serif; font-weight: 700;
          font-size: 16px; letter-spacing: 4px; padding: 13px;
          border-radius: 10px; border: none; cursor: pointer; width: 100%;
          transition: all 0.2s ease; box-shadow: 0 0 24px rgba(57,255,140,0.35);
          text-transform: uppercase; display: flex; align-items: center;
          justify-content: center; gap: 8px;
        }
        .basta-btn:hover:not(:disabled) {
          filter: brightness(1.1); box-shadow: 0 0 40px rgba(57,255,140,0.55); transform: translateY(-1px);
        }
        .basta-btn:disabled {
          background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.2);
          cursor: not-allowed; box-shadow: none;
        }

        .game-card { animation: neonPulse 4s ease-in-out infinite; }

        .score-row {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 14px; border-radius: 10px;
          background: rgba(57,255,140,0.03);
          border: 1px solid rgba(57,255,140,0.1);
          animation: scoreIn 0.35s ease both;
        }
        .score-row.me {
          background: rgba(57,255,140,0.07);
          border-color: rgba(57,255,140,0.3);
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
              <filter id="neonLineM" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
            <g stroke="#7CFFB2" strokeWidth="4" fill="none" filter="url(#neonLineM)">
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
            background: 'radial-gradient(ellipse 70% 70% at 50% 48%, transparent 35%, rgba(0,4,2,0.82) 100%)',
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
          width: '100%', maxWidth: '860px',
          display: 'flex', flexDirection: 'column', gap: '12px',
          paddingTop: '8px',
          opacity: entered ? 1 : 0,
          animation: entered ? 'riseIn 0.6s ease both' : 'none',
        }}>

          {/* HEADER REORGANIZADO */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
            
            {/* Letra: Arriba de todo y bien centrada */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              animation: entered ? 'letterPop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.3s both' : 'none',
            }}>
              <div style={{
                width: '68px', height: '68px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(4,20,11,0.85)',
                border: '2px solid rgba(57,255,140,0.55)', borderRadius: '12px',
                boxShadow: '0 0 24px rgba(57,255,140,0.2), inset 0 1px 0 rgba(57,255,140,0.1)',
              }}>
                <span style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontWeight: 700,
                  fontSize: '38px',
                  lineHeight: '68px',
                  height: '68px',
                  width: '100%',
                  color: '#eafff2',
                  animation: 'titleGlow 2.6s ease-in-out infinite',
                  display: 'block',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                }}>
                  {letra}
                </span>
              </div>
              <p style={{
                fontFamily: "'Oswald', sans-serif", fontSize: '9px', letterSpacing: '2px',
                color: 'rgba(57,255,140,0.45)', marginTop: '4px', textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}>Letra</p>
            </div>

            {/* Datos y Timer en una fila debajo de la letra */}
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', width: '100%' }}>
              {/* Meta */}
              <div>
                <p style={{
                  fontFamily: "'Oswald', sans-serif", fontSize: '11px', letterSpacing: '3px',
                  color: 'rgba(57,255,140,0.55)', textTransform: 'uppercase', margin: 0,
                }}>Sala {code} · {dificultad}</p>
                <p style={{
                  fontFamily: "'Oswald', sans-serif", fontSize: '14px',
                  color: 'rgba(255,255,255,0.4)', margin: '2px 0 0',
                  textTransform: 'uppercase', letterSpacing: '1px',
                }}>{tematica?.replace('_', ' ')}</p>
                {/* Jugadores en sala */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                  <Users size={11} strokeWidth={1.5} color="rgba(124,255,178,0.5)"/>
                  <span style={{
                    fontFamily: "'Oswald', sans-serif", fontSize: '10px',
                    color: 'rgba(124,255,178,0.5)', letterSpacing: '1px',
                  }}>{players?.length || 1} jugadores</span>
                </div>
              </div>

              {/* Timer */}
              <div style={{ textAlign: 'right' }}>
                <p style={{
                  fontFamily: "'Oswald', sans-serif", fontSize: '10px', letterSpacing: '2px',
                  color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', margin: 0,
                }}>Tiempo</p>
                <p style={{
                  fontFamily: "'Oswald', sans-serif", fontSize: '38px', fontWeight: 700,
                  margin: 0, lineHeight: 1, color: timerColor,
                  animation: timeLeft <= 10 ? 'timerWarn 0.5s ease infinite' : 'none',
                  textShadow: `0 0 18px ${timerColor}`,
                }}>{timeLeft}</p>
                <p style={{
                  fontFamily: "'Oswald', sans-serif", fontSize: '9px',
                  color: 'rgba(255,255,255,0.25)', margin: 0,
                }}>seg</p>
              </div>
            </div>

          </div>

          {/* Barra de tiempo */}
          <div style={{ height: '3px', background: 'rgba(57,255,140,0.1)', borderRadius: '2px', overflow: 'hidden', marginBottom: '16px', marginTop: '8px' }}>
            <div style={{
              height: '100%', width: `${timerPct}%`, background: timerColor,
              transition: 'width 1s linear, background 0.5s ease',
              boxShadow: `0 0 8px ${timerColor}`, borderRadius: '2px',
            }}/>
          </div>

          {/* GRILLA (con un pequeño margen superior para despegarse del header) */}
          <div style={{ overflowX: 'auto', marginTop: '12px' }}>
            <div className="game-card" style={{
              minWidth: `${60 + categorias.length * 105}px`,
              background: 'rgba(4,20,11,0.72)',
              border: '1px solid rgba(57,255,140,0.25)',
              borderTop: '2px solid rgba(57,255,140,0.6)',
              borderRadius: '14px', overflow: 'hidden',
              backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
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
                      fontFamily: "'Oswald', sans-serif", fontSize: '9px', fontWeight: 600,
                      color: 'rgba(124,255,178,0.7)', letterSpacing: '1.5px',
                      textTransform: 'uppercase', lineHeight: 1.2, display: 'block',
                    }}>/</span>
                    <span style={{
                      fontFamily: "'Oswald', sans-serif", fontSize: '9px', fontWeight: 600,
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
              }}>
                <div style={{
                  padding: '0 8px', borderRight: '1px solid rgba(57,255,140,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{
                    fontFamily: "'Oswald', sans-serif", fontSize: '12px',
                    fontWeight: 700, color: '#39ff8c', letterSpacing: '1.5px',
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
            </div>
          </div>

          {/* BASTA */}
          <button className="basta-btn" onClick={handleBasta} disabled={finished}>
            <StopCircle size={18} strokeWidth={2}/>
            ¡BASTA!
          </button>

          {/* RESULTADO */}
          {finished && scoreboard.length > 0 && (() => {
            const winner = scoreboard[0];
            const iWon   = winner.id === 'me';

            return (
              <div style={{
                background: 'rgba(4,20,11,0.82)',
                border: `1px solid ${iWon ? 'rgba(57,255,140,0.35)' : 'rgba(251,191,36,0.25)'}`,
                borderTop: `2px solid ${iWon ? '#39ff8c' : '#fbbf24'}`,
                borderRadius: '14px', padding: '20px',
                animation: 'fadeInUp 0.4s ease forwards',
                backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)',
                boxShadow: '0 30px 60px -20px rgba(0,0,0,0.75)',
              }}>

                {/* ¡TIEMPO! */}
                <div style={{
                  fontFamily: "'Oswald', sans-serif", fontSize: '20px', fontWeight: 700,
                  color: '#eafff2', letterSpacing: '3px', margin: '0 0 6px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  textTransform: 'uppercase',
                }}>
                  <Timer size={20} strokeWidth={2} color="#39ff8c"/>
                  ¡Tiempo!
                </div>

                {/* Ganador */}
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <div style={{
                    fontFamily: "'Oswald', sans-serif", fontSize: '14px', fontWeight: 700,
                    letterSpacing: '2px', textTransform: 'uppercase',
                    color: iWon ? '#39ff8c' : '#fbbf24',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    textShadow: iWon ? '0 0 16px rgba(57,255,140,0.6)' : '0 0 16px rgba(251,191,36,0.6)',
                  }}>
                    <Trophy size={18} strokeWidth={2}/>
                    {iWon ? '¡Ganaste!' : `Ganó ${winner.name}`}
                  </div>
                </div>

                {/* Scoreboard */}
                <div style={{
                  fontFamily: "'Oswald', sans-serif", fontSize: '11px', letterSpacing: '3px',
                  color: 'rgba(124,255,178,0.6)', textTransform: 'uppercase',
                  marginBottom: '10px',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <Users size={12} strokeWidth={1.5}/>
                  Posiciones
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {scoreboard.map((p, i) => (
                    <div key={p.id} className={`score-row${p.id === 'me' ? ' me' : ''}`}
                      style={{ animationDelay: `${i * 0.08}s` }}>

                      {/* Posición */}
                      <div style={{
                        fontFamily: "'Oswald', sans-serif", fontSize: '16px', fontWeight: 700,
                        color: medalColor(i), minWidth: '24px', textAlign: 'center',
                      }}>
                        {i < 3 ? <Medal size={18} strokeWidth={2} color={medalColor(i)}/> : `${i + 1}°`}
                      </div>

                      {/* Avatar */}
                      <div className="avatar">{p.name.charAt(0).toUpperCase()}</div>

                      {/* Nombre */}
                      <div style={{ flex: 1 }}>
                        <span style={{
                          fontFamily: "'Oswald', sans-serif", fontSize: '14px', fontWeight: 600,
                          color: p.id === 'me' ? '#39ff8c' : '#eafff2', letterSpacing: '0.5px',
                        }}>
                          {p.name}{p.id === 'me' ? ' (vos)' : ''}
                        </span>
                      </div>

                      {/* Puntos */}
                      <span style={{
                        fontFamily: "'Oswald', sans-serif", fontSize: '18px', fontWeight: 700,
                        color: i === 0 ? '#fbbf24' : '#39ff8c',
                        textShadow: i === 0 ? '0 0 12px rgba(251,191,36,0.5)' : 'none',
                      }}>/</span>
                      <span style={{
                        fontFamily: "'Oswald', sans-serif", fontSize: '18px', fontWeight: 700,
                        color: i === 0 ? '#fbbf24' : '#39ff8c',
                        textShadow: i === 0 ? '0 0 12px rgba(251,191,36,0.5)' : 'none',
                      }}>{p.points} pts</span>
                    </div>
                  ))}
                </div>

                {/* Botones */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  {isHost && (
                    <button onClick={() => navigate(`/room/${code}`, {
                      state: { tematica, dificultad, tiempo, players, code, isHost }
                    })} style={{
                      flex: 1, padding: '11px',
                      background: 'rgba(57,255,140,0.08)',
                      border: '1px solid rgba(57,255,140,0.3)',
                      borderRadius: '8px', cursor: 'pointer',
                      fontFamily: "'Oswald', sans-serif", fontSize: '13px',
                      fontWeight: 700, letterSpacing: '2px', color: '#7CFFB2',
                      textTransform: 'uppercase', transition: 'all 0.2s ease',
                    }}>
                      Otra ronda
                    </button>
                  )}
                  <button onClick={() => navigate('/lobby')} style={{
                    flex: 1, padding: '11px',
                    background: 'linear-gradient(135deg, #0fae5d, #39ff8c)',
                    border: 'none', borderRadius: '8px', cursor: 'pointer',
                    fontFamily: "'Oswald', sans-serif", fontSize: '13px',
                    fontWeight: 700, letterSpacing: '2px', color: '#04210f',
                    textTransform: 'uppercase',
                    boxShadow: '0 0 18px rgba(57,255,140,0.4)',
                  }}>
                    Volver al Lobby
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </>
  );
}