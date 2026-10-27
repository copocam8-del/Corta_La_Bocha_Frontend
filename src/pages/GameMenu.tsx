import { useEffect, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import FraseRotativa from '../components/FraseRotativa';
import { Bot, Home, KeyRound, Globe } from 'lucide-react';
import api from '../api/axios';
import { Avatar } from '../profile/avatars';
import { GAME_ICONS, gameIcon, gameName } from '../games/gameIcons';
import { crearSalaPath, isMultiGame, menuPath, MULTI_CONFIG, publicaPath } from '../games/multiConfig';
import { comoJugarDe } from '../games/comoJugar';
import { Encabezado, FilaAjuste, PantallaJuego } from '../games/ui/JuegoUI';
import ImpostorMenu from '../games/impostor/ImpostorMenu';

// Menú "¿Cómo querés jugar?" de cada juego (/juego/:game): solo, con amigos (sala privada o unirse
// con código) u online (partida pública). Se abre al elegir un juego en el Dashboard. El desafío
// del día no tiene este menú (es individual, una vez por día).
//
// Los juegos con "En persona" (El Impostor) preguntan primero "¿Cómo juegan?" con su propia pantalla
// (games/impostor/ImpostorMenu.tsx): En persona (un solo celular) u Online, que lleva a este mismo menú en
// /juego/:game/online (con amigos y partida pública).
//
// Formato de El Impostor (games/ui): columna de 480 px, bloques con filas, "?" con Cómo jugar arriba a la derecha.
export default function GameMenu({ online = false }: { online?: boolean }) {
  const { game = '' } = useParams<{ game: string }>();
  if (!isMultiGame(game)) return <Navigate to="/dashboard" replace />;
  if (online && !MULTI_CONFIG[game].enPersona) return <Navigate to={menuPath(game)} replace />;
  if (MULTI_CONFIG[game].enPersona && !online) return <ImpostorMenu />;
  return <Menu key={game + online} game={game} online={online} />;
}

const CSS_MENU = `
  /* "Mi perfil": arriba a la derecha, al lado del "?" (los dos fijos, como el botón Volver) */
  .menu-perfil { position: fixed; z-index: 50; top: calc(12px + env(safe-area-inset-top, 0px)); right: calc(62px + env(safe-area-inset-right, 0px));
    height: 40px; display: flex; align-items: center; gap: 8px; padding: 0 12px 0 4px; border-radius: 999px; cursor: pointer;
    background: rgba(4,20,11,0.72); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(57,255,140,0.3);
    color: #ecfff3; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600; box-shadow: 0 6px 20px -8px rgba(0,0,0,0.7);
    transition: all 0.2s ease; }
  .menu-perfil:focus-visible { outline: 2px solid #39ff8c; outline-offset: 2px; }
  @media (hover: hover) { .menu-perfil:hover { border-color: #39ff8c; box-shadow: 0 0 14px rgba(57,255,140,0.25); } }
  .menu-codigo { text-align: center; text-transform: uppercase; letter-spacing: 6px; font-family: 'Oswald', sans-serif; font-weight: 600; font-size: 20px; }
  .menu-codigo::placeholder { letter-spacing: 3px; font-size: 15px; }
`;

function Menu({ game, online }: { game: keyof typeof MULTI_CONFIG; online: boolean }) {
  const config = MULTI_CONFIG[game];
  const soloIcon = game === 'tutti_frutti' ? Bot : GAME_ICONS[game];
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [userInfo, setUserInfo] = useState<{ name: string; username: string; avatarId: string | null } | null>(null);
  const navigate = useNavigate();

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

  const unirse = (e: FormEvent) => {
    e.preventDefault();
    if (roomCode.trim().length < 6) return;
    navigate(`/room/${roomCode.trim()}`);
  };

  const perfil = (
    <button type="button" className="menu-perfil" onClick={() => navigate('/profile')}>
      <Avatar id={userInfo?.avatarId} fallback={userInfo?.name || userInfo?.username || '?'} size={32} />
      Mi perfil
    </button>
  );

  return (
    <PantallaJuego salir={{ to: config.enPersona && online ? menuPath(game) : '/dashboard' }} ayuda={comoJugarDe(game)}>
      <style>{CSS_MENU}</style>
      {typeof document === 'undefined' ? perfil : createPortal(perfil, document.body)}

      <Encabezado
        icono={gameIcon(game)}
        kicker={<FraseRotativa style={{ fontSize: '11px', letterSpacing: '3px', fontWeight: 500, color: '#7CFFB2', textTransform: 'uppercase' }} />}
        titulo={gameName(game)}
        texto={config.enPersona ? 'Online · ¿Cómo querés jugar?' : '¿Cómo querés jugar?'}
      />

      {/* Solo (El Impostor no tiene: es sólo multijugador) */}
      {config.solo && (
        <section className="card ui-filas">
          <p className="kicker">Solo</p>
          <FilaAjuste icono={soloIcon} nombre={config.solo.titulo} sub={config.solo.descripcion} testid="modo-solo"
            onClick={() => navigate(config.solo!.path)} />
        </section>
      )}

      <section className="card ui-filas">
        <p className="kicker">Con amigos</p>
        <FilaAjuste icono={Home} nombre="Crear sala privada" sub="Creá una sala e invitá a tus amigos con un código" testid="modo-crear-sala"
          onClick={() => navigate(crearSalaPath(game))} />
        <FilaAjuste icono={KeyRound} nombre="Unirse con código" sub="Ingresá el código de una sala privada" onClick={() => setShowJoinInput(!showJoinInput)} />
        {showJoinInput && (
          <form onSubmit={unirse} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              className="ui-campo menu-codigo"
              data-testid="codigo-unirse"
              aria-label="Código de la sala"
              placeholder="ABC123"
              value={roomCode}
              onChange={e => setRoomCode(e.target.value.toUpperCase())}
              maxLength={6}
              autoComplete="off"
            />
            <button type="submit" className="ui-boton" disabled={roomCode.trim().length < 6}>
              Unirse a la sala
            </button>
          </form>
        )}
      </section>

      <section className="card ui-filas">
        <p className="kicker">Online</p>
        <FilaAjuste icono={Globe} nombre="Partida pública" sub="Jugá contra alguien al azar en todo el mundo" testid="modo-publica"
          onClick={() => navigate(publicaPath(game))} />
      </section>
    </PantallaJuego>
  );
}

