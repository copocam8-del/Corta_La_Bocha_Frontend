import { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Gamepad2,
  CheckCircle2,
  Percent,
  Coins,
  Trophy,
  Flame,
  Pencil,
} from 'lucide-react';

interface ProfileData {
  id: string;
  username: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  birth_date: string | null;
  country: string | null;
  created_at: string;
  profile: {
    avatar_url: string | null;
    bio: string | null;
    favorite_team: string | null;
    favorite_country: string | null;
    favorite_player: string | null;
    matches_played: number;
    matches_won: number;
    tournaments_won: number;
    total_points: number;
    best_streak: number;
  };
}

export default function Profile() {
  const [entered, setEntered] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [favoriteTeam, setFavoriteTeam] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    api
      .get('/users/me')
      .then((res) => {
        const data: ProfileData = res.data;
        setProfile(data);
        setUsername(data.username || '');
        setBio(data.profile?.bio || '');
        setAvatarUrl(data.profile?.avatar_url || '');
        setFavoriteTeam(data.profile?.favorite_team || '');
      })
      .catch(() => navigate('/login'));
  }, []);

  const sparks = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 2 + Math.random() * 3,
        duration: 6 + Math.random() * 5,
        delay: Math.random() * 7,
        dx: (Math.random() - 0.5) * 40,
      })),
    []
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const res = await api.put('/users/me', {
        username,
        bio,
        avatar_url: avatarUrl || undefined,
        favorite_team: favoriteTeam || undefined,
      });
      setProfile(res.data);
      setSuccess(true);
      setEditing(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'No se pudo guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const fullName = profile
    ? [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.username
    : '';
  const winRate =
    profile && profile.profile.matches_played > 0
      ? Math.round((profile.profile.matches_won / profile.profile.matches_played) * 100)
      : 0;

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
        @keyframes titleGlow {
          0%, 100% { text-shadow: 0 0 12px rgba(57,255,140,0.35), 0 0 26px rgba(57,255,140,0.15); }
          50%      { text-shadow: 0 0 18px rgba(57,255,140,0.6), 0 0 40px rgba(57,255,140,0.3); }
        }
        @keyframes avatarRing {
          0%, 100% { box-shadow: 0 0 18px rgba(57,255,140,0.3), 0 0 36px rgba(57,255,140,0.12); }
          50%      { box-shadow: 0 0 26px rgba(57,255,140,0.55), 0 0 50px rgba(57,255,140,0.22); }
        }
        @keyframes slideDown {
          0%   { opacity: 0; transform: translateY(-8px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .neon-title { animation: titleGlow 2.6s ease-in-out infinite; }

        .back-corner {
          position: absolute;
          top: 16px;
          left: 18px;
          z-index: 5;
          background: rgba(4,20,11,0.55);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(57,255,140,0.3);
          border-radius: 999px;
          padding: 8px 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          color: #ecfff3;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 600;
          transition: all 0.2s ease;
        }
        .back-corner:hover {
          border-color: rgba(57,255,140,0.7);
          box-shadow: 0 0 16px rgba(57,255,140,0.3);
          transform: translateX(-2px);
        }

        .avatar-wrap {
          width: 84px;
          height: 84px;
          border-radius: 50%;
          border: 2.5px solid rgba(57,255,140,0.6);
          background: rgba(57,255,140,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #39ff8c;
          font-family: 'Oswald', sans-serif;
          font-weight: 700;
          font-size: 32px;
          overflow: hidden;
          margin: 0 auto;
          animation: avatarRing 4s ease-in-out infinite;
        }

        .profile-card {
          background: rgba(4,20,11,0.65);
          backdrop-filter: blur(18px);
          border: 1px solid rgba(57,255,140,0.25);
          borderTop: 2px solid rgba(57,255,140,0.65);
          border-radius: 14px;
          padding: 18px 20px;
          box-shadow: 0 25px 50px -15px rgba(0,0,0,0.75);
        }

        .section-label {
          font-family: 'Oswald', sans-serif;
          font-size: 10px;
          letter-spacing: 2px;
          color: rgba(124,255,178,0.55);
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .stat-box {
          border: 1px solid rgba(57,255,140,0.15);
          background: rgba(57,255,140,0.03);
          border-radius: 10px;
          padding: 10px 8px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }
        .stat-value {
          font-family: 'Oswald', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #ecfff3;
        }
        .stat-label {
          font-size: 9px;
          letter-spacing: 0.5px;
          color: rgba(180,255,205,0.55);
          text-transform: uppercase;
        }

        .field-label {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 500;
          color: rgba(180,255,205,0.7);
          margin-bottom: 5px;
          display: block;
        }
        .field-input {
          background: rgba(10,30,18,0.5);
          border: 1px solid rgba(57,255,140,0.3);
          color: #ecfff3;
          width: 100%;
          padding: 9px 12px;
          border-radius: 8px;
          font-size: 13px;
          font-family: 'Inter', sans-serif;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .field-input::placeholder { color: rgba(190,255,210,0.3); }
        .field-input:focus {
          border-color: #39ff8c;
          box-shadow: 0 0 0 3px rgba(57,255,140,0.12), 0 0 14px rgba(57,255,140,0.25);
        }
        textarea.field-input { resize: none; font-family: 'Inter', sans-serif; }

        .edit-toggle-btn {
          border: 1px solid rgba(57,255,140,0.3);
          background: rgba(57,255,140,0.04);
          color: #ecfff3;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 600;
          padding: 8px 14px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        .edit-toggle-btn:hover {
          border-color: rgba(57,255,140,0.6);
          background: rgba(57,255,140,0.08);
        }

        .save-btn {
          background: linear-gradient(135deg, #0fae5d, #39ff8c);
          color: #04210f;
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 13px;
          letter-spacing: 1px;
          padding: 11px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          width: 100%;
          transition: all 0.2s ease;
          box-shadow: 0 0 14px rgba(57,255,140,0.3);
        }
        .save-btn:hover:not(:disabled) {
          filter: brightness(1.1);
          box-shadow: 0 0 20px rgba(57,255,140,0.5);
        }
        .save-btn:disabled {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.2);
          cursor: not-allowed;
          box-shadow: none;
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '12px 24px',
        background: '#010805',
        fontFamily: "'Inter', sans-serif",
      }}>

        {/* CANCHA de fondo */}
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

        {/* motas de luz */}
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

        {/* Volver */}
        <button
          className="back-corner"
          onClick={() => navigate('/lobby')}
          style={{
            opacity: entered ? 1 : 0,
            animation: entered ? 'riseIn 0.5s ease 0.1s both' : 'none',
          }}
        >
          <ArrowLeft size={15} strokeWidth={2} />
          Lobby
        </button>

        {/* CONTENIDO */}
        <div style={{ width: '100%', maxWidth: '400px', position: 'relative', zIndex: 2 }}>

          {!profile ? (
            <p style={{ textAlign: 'center', color: 'rgba(180,255,205,0.6)', fontSize: '13px' }}>
              Cargando perfil...
            </p>
          ) : (
            <>
              {/* Encabezado identidad */}
              <div style={{
                textAlign: 'center', marginBottom: '16px',
                opacity: entered ? 1 : 0,
                animation: entered ? 'riseIn 0.6s ease both' : 'none',
              }}>
                <div className="avatar-wrap">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={profile.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    fullName.charAt(0).toUpperCase()
                  )}
                </div>
                <h1 className="neon-title" style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: '22px', fontWeight: 700,
                  letterSpacing: '0.5px', margin: '12px 0 2px',
                  color: '#eafff2', textTransform: 'uppercase',
                }}>{fullName}</h1>
                <p style={{ fontSize: '12px', color: '#7CFFB2', margin: 0 }}>
                  @{profile.username}{profile.country ? ` · ${profile.country}` : ''}
                </p>
                {profile.profile.bio && (
                  <p style={{ fontSize: '12px', color: 'rgba(180,255,205,0.7)', marginTop: '8px' }}>
                    {profile.profile.bio}
                  </p>
                )}
              </div>

              {/* Estadísticas */}
              <div className="profile-card" style={{
                opacity: entered ? 1 : 0,
                animation: entered ? 'riseIn 0.6s ease 0.1s both' : 'none',
                marginBottom: '14px',
              }}>
                <p className="section-label">Estadísticas</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  <div className="stat-box">
                    <Gamepad2 size={16} color="#39ff8c" />
                    <span className="stat-value">{profile.profile.matches_played}</span>
                    <span className="stat-label">Partidas</span>
                  </div>
                  <div className="stat-box">
                    <CheckCircle2 size={16} color="#39ff8c" />
                    <span className="stat-value">{profile.profile.matches_won}</span>
                    <span className="stat-label">Ganadas</span>
                  </div>
                  <div className="stat-box">
                    <Percent size={16} color="#39ff8c" />
                    <span className="stat-value">{winRate}%</span>
                    <span className="stat-label">Win rate</span>
                  </div>
                  <div className="stat-box">
                    <Coins size={16} color="#39ff8c" />
                    <span className="stat-value">{profile.profile.total_points}</span>
                    <span className="stat-label">Puntos</span>
                  </div>
                  <div className="stat-box">
                    <Trophy size={16} color="#39ff8c" />
                    <span className="stat-value">{profile.profile.tournaments_won}</span>
                    <span className="stat-label">Torneos</span>
                  </div>
                  <div className="stat-box">
                    <Flame size={16} color="#39ff8c" />
                    <span className="stat-value">{profile.profile.best_streak}</span>
                    <span className="stat-label">Racha</span>
                  </div>
                </div>
                {profile.profile.favorite_team && (
                  <p style={{ marginTop: '10px', fontSize: '11px', color: 'rgba(180,255,205,0.55)', textAlign: 'center' }}>
                    Hincha de <span style={{ color: '#ecfff3', fontWeight: 600 }}>{profile.profile.favorite_team}</span>
                  </p>
                )}
              </div>

              {/* Editar perfil */}
              <div className="profile-card" style={{
                opacity: entered ? 1 : 0,
                animation: entered ? 'riseIn 0.6s ease 0.18s both' : 'none',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: editing ? '12px' : 0 }}>
                  <p className="section-label" style={{ marginBottom: 0 }}>Editar perfil</p>
                  {!editing && (
                    <button className="edit-toggle-btn" onClick={() => setEditing(true)}>
                      <Pencil size={13} /> Editar
                    </button>
                  )}
                </div>

                {editing && (
                  <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px', animation: 'slideDown 0.2s ease forwards' }}>
                    <div>
                      <label className="field-label">Username</label>
                      <input
                        className="field-input"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        minLength={3}
                      />
                    </div>
                    <div>
                      <label className="field-label">URL de avatar</label>
                      <input
                        className="field-input"
                        type="url"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="field-label">Equipo favorito</label>
                      <input
                        className="field-input"
                        type="text"
                        value={favoriteTeam}
                        onChange={(e) => setFavoriteTeam(e.target.value)}
                        placeholder="Ej: Boca Juniors"
                      />
                    </div>
                    <div>
                      <label className="field-label">Bio</label>
                      <textarea
                        className="field-input"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        maxLength={160}
                        rows={3}
                      />
                      <p style={{ fontSize: '10px', color: 'rgba(180,255,205,0.4)', marginTop: '4px' }}>{bio.length}/160</p>
                    </div>

                    {error && <p style={{ color: '#ff7a7a', fontSize: '12px' }}>{error}</p>}
                    {success && <p style={{ color: '#39ff8c', fontSize: '12px' }}>Perfil actualizado</p>}

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="submit" className="save-btn" disabled={saving}>
                        {saving ? 'Guardando...' : 'Guardar cambios'}
                      </button>
                      <button
                        type="button"
                        className="edit-toggle-btn"
                        onClick={() => setEditing(false)}
                        style={{ flexShrink: 0 }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}