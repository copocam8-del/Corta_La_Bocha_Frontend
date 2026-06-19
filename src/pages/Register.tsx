import { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Calendar, Globe2, ArrowRight, ShieldCheck } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);
  const [entered, setEntered] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 80);
    return () => clearTimeout(t);
  }, []);

  // motas de luz flotando sobre la cancha
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      navigate('/login');
    } catch {
      setError('Error al registrarse. El email puede estar en uso.');
    } finally {
      setLoading(false);
    }
  };

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
            box-shadow: 0 0 18px rgba(57,255,140,0.35), 0 0 40px rgba(57,255,140,0.15), inset 0 0 0 rgba(0,0,0,0);
            border-color: rgba(57,255,140,0.45);
          }
          50% {
            box-shadow: 0 0 28px rgba(57,255,140,0.6), 0 0 60px rgba(57,255,140,0.3), inset 0 0 0 rgba(0,0,0,0);
            border-color: rgba(57,255,140,0.85);
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
          0%   { opacity: 0; transform: translateY(22px); }
          100% { opacity: 1; transform: translateY(0); }
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

        .field {
          width: 100%;
          background: rgba(10,30,18,0.5);
          border: 1px solid rgba(57,255,140,0.22);
          color: #ecfff3;
          padding: 14px 16px 14px 44px;
          border-radius: 10px;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .field::placeholder { color: rgba(190,255,210,0.4); }
        .field:focus {
          border-color: #39ff8c;
          background: rgba(57,255,140,0.08);
          box-shadow: 0 0 0 3px rgba(57,255,140,0.18), 0 0 18px rgba(57,255,140,0.3);
        }
        .field option { background: #04130a; }

        .field-wrap { position: relative; }
        .field-icon {
          position: absolute; left: 14px; top: 50%;
          transform: translateY(-50%);
          color: rgba(160,255,195,0.5);
          pointer-events: none;
          transition: color 0.2s;
        }
        .field:focus ~ .field-icon { color: #39ff8c; }

        .submit-btn {
          width: 100%;
          background: linear-gradient(135deg, #0fae5d, #39ff8c);
          color: #04210f;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 15px;
          letter-spacing: 0.3px;
          padding: 14px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 0 20px rgba(57,255,140,0.45), 0 10px 24px -8px rgba(15,174,93,0.5);
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          filter: brightness(1.1);
          box-shadow: 0 0 32px rgba(57,255,140,0.7), 0 14px 28px -8px rgba(15,174,93,0.6);
        }
        .submit-btn:active:not(:disabled) { transform: scale(0.98); }
        .submit-btn:disabled { opacity: 0.55; cursor: not-allowed; box-shadow: none; }

        .register-card {
          animation: neonPulse 4s ease-in-out infinite;
        }

        .ball-logo {
          animation: spin 14s linear infinite;
          transform-origin: center center;
        }

        .neon-title {
          animation: titleGlow 2.6s ease-in-out infinite;
        }
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

        {/* CANCHA: pasto con franjas de corte + líneas blancas/neón, con leve movimiento de cámara */}
        <div style={{
          position: 'absolute', inset: '-3%',
          animation: 'kenBurns 24s ease-in-out infinite alternate',
          pointerEvents: 'none',
        }}>
          {/* franjas de pasto cortado */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `repeating-linear-gradient(
              115deg,
              #052e16 0px, #052e16 80px,
              #064a22 80px, #064a22 160px
            )`,
          }}/>

          {/* tinte verde neón nocturno sobre el pasto (luces de estadio) */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `
              radial-gradient(ellipse 90% 70% at 15% 0%, rgba(57,255,140,0.45) 0%, transparent 60%),
              radial-gradient(ellipse 90% 70% at 85% 0%, rgba(57,255,140,0.35) 0%, transparent 60%),
              linear-gradient(180deg, rgba(2,10,6,0.55) 0%, rgba(2,8,5,0.35) 40%, rgba(1,5,3,0.7) 100%)
            `,
            mixBlendMode: 'screen',
          }}/>

          {/* líneas de cancha con glow neón */}
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

          {/* halos de reflector */}
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

          {/* viñeta para legibilidad */}
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
        <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 2 }}>

          <div style={{
            textAlign: 'center', marginBottom: '26px',
            opacity: entered ? 1 : 0,
            animation: entered ? 'riseIn 0.6s ease both' : 'none',
          }}>
            <p style={{
              fontSize: '11px', letterSpacing: '3px', fontWeight: 500,
              color: '#7CFFB2', textTransform: 'uppercase', marginBottom: '12px',
            }}>Temporada 2025</p>

            <div
              className="ball-logo"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '60px', height: '60px',
                marginBottom: '14px',
                opacity: entered ? 1 : 0,
                animation: entered
                  ? 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.15s both, spin 14s linear infinite'
                  : 'none',
                filter: 'drop-shadow(0 0 16px rgba(57,255,140,0.65))',
              }}
            >
              <svg viewBox="0 0 64 64" width="60" height="60" style={{ display: 'block' }}>
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
              fontSize: '30px', fontWeight: 700,
              letterSpacing: '1px', margin: '0 0 6px',
              color: '#eafff2', textTransform: 'uppercase',
            }}>Corta la bocha</h1>
            <p style={{
              fontSize: '13px', color: 'rgba(180,255,205,0.75)', margin: 0,
            }}>El tutti frutti del fútbol</p>
          </div>

          <div className="register-card" style={{
            background: 'rgba(4,20,11,0.62)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border: '1px solid rgba(57,255,140,0.3)',
            borderTop: '2px solid rgba(57,255,140,0.7)',
            borderRadius: '16px',
            padding: '26px 24px',
            boxShadow: '0 30px 60px -20px rgba(0,0,0,0.75)',
            opacity: entered ? 1 : 0,
            animation: entered ? 'riseIn 0.6s ease 0.1s both' : 'none',
          }}>
            <p style={{
              textAlign: 'center', fontSize: '13px', fontWeight: 500,
              color: 'rgba(220,255,235,0.9)', marginBottom: '18px',
            }}>Crear cuenta</p>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#fca5a5',
                padding: '10px 14px', borderRadius: '8px',
                fontSize: '12px', textAlign: 'center',
                marginBottom: '14px',
                animation: 'fadeIn 0.3s ease',
              }}>{error}</div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="field-wrap">
                  <input
                    className="field"
                    name="name"
                    placeholder="Nombre"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                  <span className="field-icon"><User size={16} strokeWidth={1.5} /></span>
                </div>
                <div className="field-wrap">
                  <input
                    className="field"
                    name="lastName"
                    placeholder="Apellido"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                  />
                  <span className="field-icon"><User size={16} strokeWidth={1.5} /></span>
                </div>
              </div>

              <div className="field-wrap">
                <input
                  className="field"
                  name="username"
                  placeholder="Nombre de usuario"
                  value={form.username}
                  onChange={handleChange}
                  required
                />
                <span className="field-icon"><User size={16} strokeWidth={1.5} /></span>
              </div>

              <div className="field-wrap">
                <input
                  className="field"
                  name="birthDate"
                  type="date"
                  value={form.birthDate}
                  onChange={handleChange}
                  required
                  style={{ colorScheme: 'dark' }}
                />
                <span className="field-icon"><Calendar size={16} strokeWidth={1.5} /></span>
              </div>

              <div className="field-wrap">
                <select
                  className="field"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  required
                >
                  <option value="">Seleccioná tu país</option>
                  {PAISES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <span className="field-icon"><Globe2 size={16} strokeWidth={1.5} /></span>
              </div>

              <div className="field-wrap">
                <input
                  className="field"
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
                <span className="field-icon"><Mail size={16} strokeWidth={1.5} /></span>
              </div>

              <div className="field-wrap">
                <input
                  className="field"
                  name="password"
                  type="password"
                  placeholder="Contraseña"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <span className="field-icon"><Lock size={16} strokeWidth={1.5} /></span>
              </div>

              <button type="submit" className="submit-btn" disabled={loading} style={{ marginTop: '6px' }}>
                {loading ? 'Creando cuenta...' : (<>¡A jugar! <ArrowRight size={16} strokeWidth={2} /></>)}
              </button>
            </form>

            <div style={{ height: '1px', background: 'rgba(57,255,140,0.18)', margin: '20px 0 14px' }}/>

            <p style={{ textAlign: 'center', fontSize: '12px', color: 'rgba(180,255,205,0.6)', margin: 0 }}>
              ¿Ya tenés cuenta?{' '}
              <Link to="/login" style={{
                color: '#7CFFB2', fontWeight: 600, textDecoration: 'none',
                borderBottom: '1px solid rgba(124,255,178,0.45)', paddingBottom: '1px',
              }}>
                Iniciá sesión
              </Link>
            </p>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            marginTop: '16px', fontSize: '11px', color: 'rgba(180,255,205,0.45)',
            opacity: entered ? 1 : 0,
            animation: entered ? 'fadeIn 0.6s ease 0.4s both' : 'none',
          }}>
            <ShieldCheck size={13} strokeWidth={1.8} />
            Datos protegidos
          </div>
        </div>
      </div>
    </>
  );
}