import { useState } from 'react';
import { Navigate, useNavigate, useLocation, useParams } from 'react-router-dom';
import { Copy, Share2, ChevronRight, Check } from 'lucide-react';
import { gameIcon, gameName } from '../games/gameIcons';
import { isMultiGame, menuOnlinePath, MULTI_CONFIG } from '../games/multiConfig';
import { comoJugarDe } from '../games/comoJugar';
import { Encabezado, PantallaJuego } from '../games/ui/JuegoUI';

const CSS_CODIGO = `
  @keyframes codePop { 0% { opacity: 0; transform: scale(0.7); } 100% { opacity: 1; transform: scale(1); } }
  .codigo-letras { display: flex; justify-content: center; gap: 6px; animation: codePop 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.2s both; }
  .codigo-letra { flex: 0 1 50px; min-width: 0; height: 62px; display: flex; align-items: center; justify-content: center; border-radius: 10px;
    background: rgba(10,30,18,0.5); border: 1px solid rgba(57,255,140,0.4); box-shadow: 0 0 12px rgba(57,255,140,0.15);
    font-family: 'Oswald', sans-serif; font-size: 30px; font-weight: 700; color: #39ff8c; text-shadow: 0 0 16px rgba(57,255,140,0.7); }
  @media (prefers-reduced-motion: reduce) { .codigo-letras { animation: none; } }
`;

// Muestra el código de la sala que creó el servidor, para compartirlo
export default function RoomCode() {
  const navigate = useNavigate();
  const location = useLocation();
  const { code } = (location.state || {}) as { code?: string };
  const { game: param } = useParams<{ game: string }>();
  const game = isMultiGame(param) ? param : 'tutti_frutti';
  const config = MULTI_CONFIG[game];

  const [copied, setCopied]   = useState(false);

  const link = `${window.location.origin}/room/${code}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(code ?? '').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Corta La Bocha',
        text: `¡Sumate a mi sala! Código: ${code}`,
        url: link,
      });
    } else {
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleContinuar = () => {
    navigate(`/room/${code}`);
  };

  if (!code) return <Navigate to={menuOnlinePath(game)} replace />;

  return (
    <PantallaJuego
      salir={{ to: menuOnlinePath(game) }}
      ayuda={comoJugarDe(game)}
      barra={
        <button className="ui-boton" data-testid="ir-a-la-sala" onClick={handleContinuar}>
          Ir a la sala
          <ChevronRight size={20} strokeWidth={2.5} />
        </button>
      }
    >
      <style>{CSS_CODIGO}</style>
      <Encabezado icono={gameIcon(game)} kicker={`Sala privada · ${gameName(game)}`} titulo="Código de sala" texto="Compartilo con tus amigos para que se unan" />

      <div className="card pulse" style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
        <p className="kicker">Tu código</p>
        <div className="codigo-letras" data-testid="codigo" aria-label={`Código ${code}`}>
          {code.split('').map((char, i) => <span key={i} className="codigo-letra">{char}</span>)}
        </div>
        <p className="ui-texto" style={{ fontSize: '14px' }}>
          De {config.minPlayers ?? 2} a {config.maxPlayers} jugadores
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className={`ui-chico${copied ? ' activo' : ''}`} style={{ flex: 1 }} onClick={handleCopy}>
            {copied ? <Check size={18} strokeWidth={2.5}/> : <Copy size={18} />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
          <button type="button" className="ui-chico" style={{ flex: 1 }} onClick={handleShare}>
            <Share2 size={18} />
            Compartir
          </button>
        </div>
      </div>
    </PantallaJuego>
  );
}
