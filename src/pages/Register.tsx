import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

const PAISES = [
  "Argentina", "Brasil", "Uruguay", "España", "Francia",
  "Alemania", "Italia", "Inglaterra", "Portugal", "México",
  "Colombia", "Chile", "Paraguay", "Bolivia", "Perú", "Otro"
];

export default function Register() {
  const [form, setForm] = useState({
    name: '', lastName: '', username: '',
    birthDate: '', country: '', email: '', password: ''
  });
  const [error, setError] = useState('');
  const [phase, setPhase] = useState<'intro' | 'settle' | 'ready'>('intro');
  const navigate = useNavigate();

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('settle'), 2200);
    const t2 = setTimeout(() => setPhase('ready'), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', form);
      navigate('/login');
    } catch {
      setError('Error al registrarse. El email puede estar en uso.');
    }
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

        .field-input {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(56,189,248,0.15);
          color: #e2e8f0;
          width: 100%;
          padding: 11px 14px;
          border-radius: 8px;
          font-size: 13px;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .field-input::placeholder { color: rgba(148,163,184,0.5); }
        .field-input:focus {
          border-color: rgba(56,189,248,0.55);
          background: rgba(56,189,248,0.06);
          box-shadow: 0 0 0 3px rgba(56,189,248,0.08);
        }
        .field-input option { background: #0a1628; }

        .submit-btn {
          background: linear-gradient(90deg, #0284c7, #38bdf8, #0284c7);
          background-size: 200% auto;
          color: #fff;
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 700;
          font-size: 15px;
          letter-spacing: 3px;
          padding: 13px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          width: 100%;
          transition: background-position 0.4s, transform 0.15s, box-shadow 0.2s;
          box-shadow: 0 0 20px rgba(56,189,248,0.25);
        }
        .submit-btn:hover {
          background-position: right center;
          box-shadow: 0 0 30px rgba(56,189,248,0.45);
          transform: translateY(-1px);
        }
        .submit-btn:active { transform: scale(0.98); }
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

        {/* Fondo estadio */}
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

        {/* Estrella Champions */}
        <svg style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -65%)',
          width: '480px', height: '480px',
          opacity: phase === 'ready' ? 0.07 : phase === 'settle' ? 0.1 : 0.18,
          transition: 'opacity 1s ease',
          pointerEvents: 'none',
          animation: phase !== 'intro' ? 'starGlow 4s ease-in-out infinite' : 'none',
        }} viewBox="0 0 200 200">
          <polygon
            points="100,10 120,70 180,70 132,108 150,170 100,133 50,170 68,108 20,70 80,70"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
            strokeDasharray="1200"
            strokeDashoffset="0"
            style={{
              animation: 'starDraw 2s cubic-bezier(0.4,0,0.2,1) forwards',
              filter: 'drop-shadow(0 0 6px #38bdf8)',
            }}
          />
        </svg>

        {/* Haces de luz */}
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

        <div style={{
          position: 'absolute', top: '-5%', left: '50%',
          width: '2px', height: '80%',
          background: 'linear-gradient(to bottom, rgba(56,189,248,0.6) 0%, transparent 100%)',
          transform: 'translateX(-50%)',
          opacity: phase === 'intro' ? 0.7 : 0.12,
          transition: 'opacity 1.2s ease',
          pointerEvents: 'none',
        }}/>

        {/* Suelo / cancha */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '35%',
          background: 'linear-gradient(to top, rgba(14,42,64,0.8) 0%, transparent 100%)',
          animation: phase === 'intro' ? 'floorAppear 1.8s ease 0.4s both' : 'none',
          pointerEvents: 'none',
        }}/>
        <svg style={{
          position: 'absolute', bottom: 0, left: 0, width: '100%', height: '30%',
          opacity: phase === 'ready' ? 0.12 : phase === 'settle' ? 0.18 : 0.28,
          transition: 'opacity 1s ease',
          pointerEvents: 'none',
        }} viewBox="0 0 800 200" preserveAspectRatio="xMidYMax slice">
          {[...Array(9)].map((_, i) => (
            <line key={i} x1={400} y1={0} x2={i * 100} y2={200}
              stroke="#38bdf8" strokeWidth="0.8" opacity="0.6"/>
          ))}
          {[40, 80, 120, 160, 200].map((y, i) => (
            <line key={i} x1={0} y1={y} x2={800} y2={y}
              stroke="#38bdf8" strokeWidth="0.5" opacity="0.4"/>
          ))}
          <line x1={400} y1={0} x2={400} y2={200} stroke="#38bdf8" strokeWidth="1.2" opacity="0.8"/>
        </svg>

        {/* Partículas intro */}
        {phase === 'intro' && [...Array(12)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${10 + i * 7.5}%`,
            bottom: `${20 + (i % 4) * 15}%`,
            width: '2px', height: '2px',
            borderRadius: '50%',
            background: '#38bdf8',
            animation: `particleFade ${0.8 + i * 0.15}s ease ${i * 0.1}s both`,
            boxShadow: '0 0 6px #38bdf8',
            pointerEvents: 'none',
          }}/>
        ))}

        {/* Contenido */}
        <div style={{
          width: '100%', maxWidth: '400px',
          position: 'relative', zIndex: 2,
          animation: 'formEnter 0.7s ease 1.8s both',
        }}>
          {/* Título */}
          <div style={{
            textAlign: 'center', marginBottom: '28px',
            animation: 'titleEnter 0.8s ease 1.5s both',
          }}>
            <div style={{ position: 'relative', display: 'inline-block', marginBottom: '12px' }}>
              <div style={{ fontSize: '42px', lineHeight: 1 }}>⚽</div>
              <div style={{
                position: 'absolute', inset: '-8px',
                borderRadius: '50%',
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
            }}>CORTA LA BOCHA</h1>
            <p style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: '11px', color: 'rgba(56,189,248,0.6)',
              letterSpacing: '4px', margin: '0 0 14px', textTransform: 'uppercase',
            }}>El Tutti Frutti del Fútbol</p>
            <div style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent, #38bdf8, transparent)',
              opacity: 0.4, marginBottom: '10px',
            }}/>
            <p style={{ fontSize: '11px', color: 'rgba(148,163,184,0.5)', fontStyle: 'italic', margin: 0 }}>
              "¡El próximo campeón ya está registrándose!"
            </p>
          </div>

          {/* Card */}
          <div style={{
            background: 'rgba(10,22,50,0.85)',
            border: '1px solid rgba(56,189,248,0.15)',
            borderRadius: '16px',
            overflow: 'hidden',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 0 40px rgba(2,8,23,0.8), inset 0 1px 0 rgba(56,189,248,0.1)',
          }}>
            <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #38bdf8, #7dd3fc, #38bdf8, transparent)' }}/>
            <div style={{ padding: '24px' }}>
              <h2 style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                textAlign: 'center', color: 'rgba(148,163,184,0.7)',
                fontSize: '11px', letterSpacing: '3px',
                marginBottom: '20px', textTransform: 'uppercase',
              }}>Crear cuenta</h2>

              {error && (
                <div style={{
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#fca5a5', padding: '10px 14px',
                  borderRadius: '8px', fontSize: '12px',
                  textAlign: 'center', marginBottom: '16px',
                }}>{error}</div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <input className="field-input" name="name" placeholder="Nombre" value={form.name} onChange={handleChange} required/>
                  <input className="field-input" name="lastName" placeholder="Apellido" value={form.lastName} onChange={handleChange} required/>
                </div>
                <input className="field-input" name="username" placeholder="Nombre de usuario" value={form.username} onChange={handleChange} required/>
                <input className="field-input" name="birthDate" type="date" value={form.birthDate} onChange={handleChange} required style={{ colorScheme: 'dark' }}/>
                <select className="field-input" name="country" value={form.country} onChange={handleChange} required>
                  <option value="">🌍 Seleccioná tu país</option>
                  {PAISES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <input className="field-input" name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required/>
                <input className="field-input" name="password" type="password" placeholder="Contraseña" value={form.password} onChange={handleChange} required/>
                <button type="submit" className="submit-btn" style={{ marginTop: '6px' }}>
                  ¡A JUGAR!
                </button>
              </form>

              <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '20px 0 16px' }}/>
              <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(148,163,184,0.4)', margin: 0 }}>
                ¿Ya tenés cuenta?{' '}
                <Link to="/login" style={{ color: '#38bdf8', fontWeight: 500, textDecoration: 'none' }}>
                  Iniciá sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}