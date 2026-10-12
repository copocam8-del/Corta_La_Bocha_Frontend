import { useEffect, useState, type ReactNode } from 'react';

// Fondo (cancha) y estilos compartidos de las pantallas del multijugador, con el mismo look que
// el resto de la app.

// Chispas con posiciones fijas (pseudoaleatorias pero estables entre renders)
const SPARKS = Array.from({ length: 16 }).map((_, i) => {
  const r = (n: number) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
  return { id: i, left: r(1) * 100, size: 2 + r(2) * 3, duration: 6 + r(3) * 5, delay: r(4) * 7, dx: (r(5) - 0.5) * 40 };
});

const CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes kenBurns { 0% { transform: scale(1) translate(0,0); } 100% { transform: scale(1.06) translate(-1%,-1%); } }
  @keyframes floodPulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 0.9; } }
  @keyframes lineGlow { 0%, 100% { opacity: 0.35; } 50% { opacity: 0.75; } }
  @keyframes neonPulse {
    0%, 100% { box-shadow: 0 0 18px rgba(57,255,140,0.25), 0 0 40px rgba(57,255,140,0.1); border-color: rgba(57,255,140,0.3); }
    50% { box-shadow: 0 0 28px rgba(57,255,140,0.5), 0 0 60px rgba(57,255,140,0.2); border-color: rgba(57,255,140,0.7); }
  }
  @keyframes riseIn { 0% { opacity: 0; transform: translateY(22px); } 100% { opacity: 1; transform: translateY(0); } }
  @keyframes titleGlow {
    0%, 100% { text-shadow: 0 0 16px rgba(57,255,140,0.45), 0 0 36px rgba(57,255,140,0.2); }
    50% { text-shadow: 0 0 24px rgba(57,255,140,0.75), 0 0 54px rgba(57,255,140,0.4); }
  }
  @keyframes playerIn { 0% { opacity: 0; transform: translateX(-16px); } 100% { opacity: 1; transform: translateX(0); } }
  @keyframes drift { 0% { transform: translate(0,0); opacity: 0; } 15% { opacity: 0.9; } 100% { transform: translate(var(--dx),-160px); opacity: 0; } }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
  @keyframes letterPop { 0% { transform: scale(0.3); opacity: 0; } 70% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }
  @keyframes timerWarn { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.12); } }

  .card {
    background: rgba(4,20,11,0.66); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
    border: 1px solid rgba(57,255,140,0.3); border-top: 2px solid rgba(57,255,140,0.7);
    border-radius: 16px; padding: 20px; box-shadow: 0 30px 60px -20px rgba(0,0,0,0.75);
  }
  .card.pulse { animation: neonPulse 4s ease-in-out infinite; }
  .neon-title { font-family: 'Oswald', sans-serif; font-weight: 700; color: #eafff2; text-transform: uppercase;
    letter-spacing: 1px; animation: titleGlow 2.6s ease-in-out infinite; }
  .kicker { font-family: 'Oswald', sans-serif; font-size: 11px; letter-spacing: 3px; color: #7CFFB2; text-transform: uppercase; }
  .section-label { font-family: 'Oswald', sans-serif; font-size: 11px; letter-spacing: 3px; color: rgba(124,255,178,0.6);
    text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
  .option-btn { font-family: 'Oswald', sans-serif; font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase;
    padding: 7px 12px; border-radius: 8px; border: 1px solid rgba(57,255,140,0.2); background: rgba(57,255,140,0.03);
    color: rgba(180,255,205,0.55); cursor: pointer; transition: all 0.18s ease; flex: 1; text-align: center; }
  .option-btn:hover:not(:disabled) { border-color: rgba(57,255,140,0.5); background: rgba(57,255,140,0.07); color: #eafff2; }
  .option-btn.active { border-color: #39ff8c; background: rgba(57,255,140,0.12); color: #39ff8c; box-shadow: 0 0 12px rgba(57,255,140,0.2); }
  .option-btn:disabled { opacity: 0.55; cursor: default; }
  .main-btn { background: linear-gradient(135deg, #0fae5d, #39ff8c); color: #04210f; font-family: 'Oswald', sans-serif; font-weight: 700;
    font-size: 16px; letter-spacing: 3px; padding: 14px; border-radius: 10px; border: none; cursor: pointer; width: 100%;
    text-transform: uppercase; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s ease;
    box-shadow: 0 0 22px rgba(57,255,140,0.35); }
  .main-btn:hover:not(:disabled) { filter: brightness(1.1); box-shadow: 0 0 36px rgba(57,255,140,0.55); transform: translateY(-1px); }
  .main-btn:disabled { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.25); cursor: not-allowed; box-shadow: none; }
  .ghost-btn { background: transparent; color: rgba(180,255,205,0.6); border: 1px solid rgba(57,255,140,0.25); border-radius: 10px;
    padding: 10px; font-family: 'Oswald', sans-serif; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; width: 100%; }
  .ghost-btn:hover { color: #eafff2; border-color: rgba(57,255,140,0.5); }
  .player-row { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px;
    background: rgba(57,255,140,0.03); border: 1px solid rgba(57,255,140,0.1); animation: playerIn 0.35s ease both; }
  .avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
    background: rgba(57,255,140,0.1); border: 1px solid rgba(57,255,140,0.3); font-family: 'Oswald', sans-serif;
    font-size: 14px; font-weight: 700; color: #39ff8c; flex-shrink: 0; }
  .dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .waiting-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(57,255,140,0.4); animation: pulse 1.4s ease-in-out infinite; }
  .spinner { width: 36px; height: 36px; border-radius: 50%; border: 3px solid rgba(57,255,140,0.15); border-top-color: #39ff8c;
    animation: spin 1s linear infinite; margin: 8px auto; }
  .grid-input { background: rgba(57,255,140,0.04); border: 1px solid rgba(57,255,140,0.18); border-radius: 8px; color: #39ff8c;
    width: 100%; padding: 10px 12px; font-size: 14px; font-family: 'Oswald', sans-serif; font-weight: 600; letter-spacing: 1px;
    outline: none; text-transform: uppercase; }
  .grid-input:focus { border-color: rgba(57,255,140,0.6); background: rgba(57,255,140,0.07); }
  .grid-input:disabled { opacity: 0.5; }
  .notice { padding: 10px 12px; border-radius: 10px; background: rgba(251,191,36,0.1); border: 1px solid rgba(251,191,36,0.45);
    color: #fde68a; font-size: 12px; line-height: 1.5; }
  .error { padding: 10px 12px; border-radius: 10px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.45);
    color: #fca5a5; font-size: 13px; line-height: 1.5; }
`;

export default function MultiShell({ children, maxWidth = 520 }: { children: ReactNode; maxWidth?: number }) {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', background: '#010805' }}>
        <div style={{ position: 'absolute', inset: '-3%', animation: 'kenBurns 24s ease-in-out infinite alternate', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(115deg,#052e16 0px,#052e16 80px,#064a22 80px,#064a22 160px)' }} />
          <div style={{
            position: 'absolute', inset: 0, mixBlendMode: 'screen',
            background: `radial-gradient(ellipse 90% 70% at 15% 0%, rgba(57,255,140,0.45) 0%, transparent 60%),
              radial-gradient(ellipse 90% 70% at 85% 0%, rgba(57,255,140,0.35) 0%, transparent 60%),
              linear-gradient(180deg, rgba(2,10,6,0.55) 0%, rgba(2,8,5,0.35) 40%, rgba(1,5,3,0.7) 100%)`,
          }} />
          <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.5, animation: 'lineGlow 4.5s ease-in-out infinite' }}>
            <g stroke="#7CFFB2" strokeWidth="4" fill="none">
              <rect x="80" y="60" width="1440" height="780" />
              <line x1="800" y1="60" x2="800" y2="840" />
              <circle cx="800" cy="450" r="130" />
              <rect x="80" y="290" width="240" height="320" />
              <rect x="1280" y="290" width="240" height="320" />
            </g>
          </svg>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 70% at 50% 48%, transparent 35%, rgba(0,4,2,0.8) 100%)' }} />
        </div>
        {SPARKS.map((s) => (
          <div key={s.id} style={{
            position: 'absolute', bottom: '30%', left: `${s.left}%`, width: `${s.size}px`, height: `${s.size}px`, borderRadius: '50%',
            background: 'rgba(160,255,200,0.9)', boxShadow: '0 0 8px rgba(57,255,140,0.8)',
            animation: `drift ${s.duration}s ease-out ${s.delay}s infinite`, '--dx': `${s.dx}px`, pointerEvents: 'none',
          } as React.CSSProperties} />
        ))}
      </div>
      <div style={{
        position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        // Arriba queda lugar para el botón "Volver" (fijo arriba a la izquierda)
        padding: '52px 16px 24px', fontFamily: "'Inter', sans-serif", color: '#eafff2',
      }}>
        <div style={{
          width: '100%', maxWidth: `${maxWidth}px`, display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '12px',
          opacity: entered ? 1 : 0, animation: entered ? 'riseIn 0.5s ease both' : 'none',
        }}>
          {children}
        </div>
      </div>
    </>
  );
}
