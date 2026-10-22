import { createElement, useState, useEffect, useMemo } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import FraseRotativa from '../components/FraseRotativa';
import { Bot, Home, KeyRound, Globe, Smartphone, Wifi } from 'lucide-react';
import api from '../api/axios';
import BackButton from '../components/BackButton';
import { Avatar } from '../profile/avatars';
import { GAME_ICONS, gameName } from '../games/gameIcons';
import { crearSalaPath, isMultiGame, menuOnlinePath, menuPath, MULTI_CONFIG, publicaPath } from '../games/multiConfig';

// Menú "¿Cómo querés jugar?" de cada juego (/juego/:game): solo, con amigos (sala privada o unirse
// con código) u online (partida pública). Se abre al elegir un juego en el Dashboard. El desafío
// del día no tiene este menú (es individual, una vez por día).
//
// Los juegos con "En persona" (El Impostor) preguntan primero "¿Cómo juegan?": En persona (un solo
// celular) u Online, que lleva a este mismo menú en /juego/:game/online (con amigos y partida pública).
export default function GameMenu({ online = false }: { online?: boolean }) {
  const { game = '' } = useParams<{ game: string }>();
  if (!isMultiGame(game)) return <Navigate to="/dashboard" replace />;
  if (online && !MULTI_CONFIG[game].enPersona) return <Navigate to={menuPath(game)} replace />;
  return <Menu key={game + online} game={game} online={online} />;
}

function Menu({ game, online }: { game: keyof typeof MULTI_CONFIG; online: boolean }) {
  const config = MULTI_CONFIG[game];
  const elegir = !!config.enPersona && !online; // primero "¿Cómo juegan?"
  const soloIcon = createElement(game === 'tutti_frutti' ? Bot : GAME_ICONS[game], { size: 24, strokeWidth: 1.5 });
  const [entered, setEntered] = useState(false);
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [userInfo, setUserInfo] = useState<{ name: string; username: string; avatarId: string | null } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    api
      .get('/users/me')
      .then((res) => {
        const data = res.data;
        const name = [data.first_name, data.last_name].filter(Boolean).join(' ') || data.username;
        setUserInfo({
          name,
          username: data.username,
          avatarId: data.profile?.avatar_id ?? null,
        });
      })
      .catch(() => {});
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
        @keyframes cornerPop {
          0%   { opacity: 0; transform: scale(0.7) translateY(-6px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
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

        .profile-corner {
          position: absolute;
          top: 16px;
          right: 18px;
          z-index: 5;
          background: rgba(4,20,11,0.55);
          backdrop-filter: blur(10px);
          WebkitBackdropFilter: blur(10px);
          border: 1px solid rgba(57,255,140,0.3);
          border-radius: 999px;
          padding: 5px 12px 5px 5px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }
        .profile-corner:hover {
          border-color: rgba(57,255,140,0.7);
          box-shadow: 0 0 16px rgba(57,255,140,0.3);
          transform: translateY(-1px);
        }
        .profile-corner-label {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 600;
          color: #ecfff3;
          letter-spacing: 0.3px;
        }
        .profile-avatar {
          width: 32px;
          height: 32px;
          min-width: 32px;
          border-radius: 50%;
          border: 1.5px solid rgba(57,255,140,0.55);
          background: rgba(57,255,140,0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #39ff8c;
          font-family: 'Oswald', sans-serif;
          font-weight: 700;
          font-size: 13px;
          overflow: hidden;
          flex-shrink: 0;
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
        padding: '68px 16px 16px',
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

        <BackButton to={config.enPersona && online ? menuPath(game) : '/dashboard'} />

        {/* PERFIL - esquina superior derecha */}
        <button
          className="profile-corner"
          onClick={() => navigate('/profile')}
          style={{
            opacity: entered ? 1 : 0,
            animation: entered ? 'cornerPop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.2s both' : 'none',
          }}
        >
          <Avatar id={userInfo?.avatarId} fallback={userInfo?.name || userInfo?.username || '?'} size={32} />
          <span className="profile-corner-label">Mi perfil</span>
        </button>

        {/* CONTENIDO */}
        <div style={{ width: '100%', maxWidth: '400px', position: 'relative', zIndex: 2 }}>

          <div style={{
            textAlign: 'center', marginBottom: '14px',
            opacity: entered ? 1 : 0,
            animation: entered ? 'riseIn 0.6s ease both' : 'none',
          }}>
            <FraseRotativa style={{
              fontSize: '11px', letterSpacing: '3px', fontWeight: 500,
              color: '#7CFFB2', textTransform: 'uppercase', marginBottom: '6px',
            }} />

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
            }}>{gameName(game)}</h1>
            <p style={{
              fontSize: '12px', color: 'rgba(180,255,205,0.75)', margin: 0,
            }}>{elegir ? '¿Cómo juegan?' : config.enPersona ? 'Online · ¿Cómo querés jugar?' : '¿Cómo querés jugar?'}</p>
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

            {/* "¿Cómo juegan?": En persona u Online */}
            {elegir && config.enPersona && (
              <>
                <button className="mode-card" data-testid="modo-en-persona" onClick={() => navigate(config.enPersona!.path)}>
                  <span className="mode-card-icon"><Smartphone size={24} strokeWidth={1.5} /></span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>En persona</div>
                    <div style={{ fontSize: '11px', color: 'rgba(180,255,205,0.5)', marginTop: '1px' }}>{config.enPersona.descripcion}</div>
                  </div>
                </button>
                <button className="mode-card" data-testid="modo-online" onClick={() => navigate(menuOnlinePath(game))}>
                  <span className="mode-card-icon"><Wifi size={24} strokeWidth={1.5} /></span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>Online</div>
                    <div style={{ fontSize: '11px', color: 'rgba(180,255,205,0.5)', marginTop: '1px' }}>Cada uno desde su casa</div>
                  </div>
                </button>
              </>
            )}

            {!elegir && (<>
            {/* Solo (El Impostor no tiene: es sólo multijugador) */}
            {config.solo && (
              <>
                <p className="section-label">Solo</p>
                <button className="mode-card" data-testid="modo-solo" onClick={() => navigate(config.solo!.path)}>
                  <span className="mode-card-icon">{soloIcon}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{config.solo.titulo}</div>
                    <div style={{ fontSize: '11px', color: 'rgba(180,255,205,0.5)', marginTop: '1px' }}>{config.solo.descripcion}</div>
                  </div>
                </button>
              </>
            )}

            {/* Con amigos */}
            <p className="section-label" style={{ marginTop: config.solo ? '4px' : 0 }}>Con amigos</p>

            <button className="mode-card" data-testid="modo-crear-sala" onClick={() => navigate(crearSalaPath(game))}>
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
                  data-testid="codigo-unirse"
                  placeholder="ABC123"
                  value={roomCode}
                  onChange={e => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={6}
                />
                <button
                  className="join-btn"
                  disabled={roomCode.trim().length < 6}
                  onClick={() => navigate(`/room/${roomCode.trim()}`)}
                >
                  Unirse a la sala
                </button>
              </div>
            )}

            {/* Online */}
            <p className="section-label" style={{ marginTop: '4px' }}>Online</p>
            <button className="mode-card" data-testid="modo-publica" onClick={() => navigate(publicaPath(game))}>
              <span className="mode-card-icon"><Globe size={24} strokeWidth={1.5} /></span>
              <div>
                <div style={{ fontWeight: 600, fontSize: '13px' }}>Partida pública</div>
                <div style={{ fontSize: '11px', color: 'rgba(180,255,205,0.5)', marginTop: '1px' }}>Jugá contra alguien al azar en todo el mundo</div>
              </div>
            </button>
            </>)}

          </div>
        </div>
      </div>
    </>
  );
}