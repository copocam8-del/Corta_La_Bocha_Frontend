import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Search, Users, X } from 'lucide-react';
import { gameIcon, gameName } from '../games/gameIcons';
import { publicaPath } from '../games/multiConfig';
import { comoJugarDe } from '../games/comoJugar';
import { Encabezado, PantallaJuego } from '../games/ui/JuegoUI';
import { emitAck, getSocket } from '../multi/socket';
import { clockOffset, secondsUntil } from '../multi/clock';
import { useNow } from '../multi/useNow';
import { temaLabel, type QueueState } from '../multi/types';

// Cola pública: el servidor junta jugadores con la misma temática y tamaño de partida. Cuando hay
// suficientes, arma la sala y nos manda el código ("queue:matched"): vamos directo a la partida.
export default function PublicQueue() {
  const navigate = useNavigate();
  const location = useLocation();
  const { game = 'tutti_frutti', tematica, size } = (location.state || {}) as { game?: string; tematica?: string; size?: 'pocos' | 'muchos' };
  const [queue, setQueue] = useState<QueueState | null>(null);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const now = useNow(!!queue?.startsAt);

  useEffect(() => {
    if (tematica === undefined || !size) return;
    const s = getSocket();
    let matched = false;
    const onState = (q: QueueState) => {
      setOffset(clockOffset(q.serverNow, Date.now()));
      setQueue(q);
    };
    const onMatched = ({ code }: { code: string }) => {
      matched = true;
      navigate(`/room/${code}`, { replace: true });
    };
    const join = () => void emitAck('queue:join', { game, tematica, size }).then((r) => setError(r.ok ? null : r.error));
    const onConnectError = (err: Error) => setError(err.message || 'No se pudo conectar con el servidor.');
    s.on('queue:state', onState);
    s.on('queue:matched', onMatched);
    s.on('connect', join);
    s.on('connect_error', onConnectError);
    if (s.connected) join();
    return () => {
      s.off('queue:state', onState);
      s.off('queue:matched', onMatched);
      s.off('connect', join);
      s.off('connect_error', onConnectError);
      if (!matched) void emitAck('queue:leave');
    };
  }, [game, tematica, size, navigate]);

  if (tematica === undefined || !size) return <Navigate to={publicaPath(game)} replace />;

  const faltan = queue ? Math.max(0, queue.min - queue.players.length) : null;

  return (
    // Volver = salir de la cola (al desmontar se avisa queue:leave)
    <PantallaJuego salir={{ to: publicaPath(game) }} ayuda={comoJugarDe(game)}>
      <Encabezado icono={gameIcon(game)} kicker={`Partida pública · ${game === 'tutti_frutti' ? temaLabel(tematica) : gameName(game)}`}
        titulo="Buscando rivales" />

      <div className="card pulse" style={{ textAlign: 'center' }} data-testid="cola">
        <Search size={30} color="#39ff8c" style={{ display: 'block', margin: '0 auto', animation: 'pulse 1.4s ease-in-out infinite', filter: 'drop-shadow(0 0 10px rgba(57,255,140,0.6))' }} />
        {queue?.startsAt ? (
          <p className="ui-texto" style={{ marginTop: '10px', color: '#eafff2' }}>
            ¡Ya hay partida! Arranca en <strong style={{ color: '#39ff8c' }}>{secondsUntil(queue.startsAt, offset, now)} s</strong> (pueden sumarse más)
          </p>
        ) : (
          <p className="ui-texto" style={{ marginTop: '10px' }}>
            {faltan === null ? 'Entrando a la cola…' : `Esperando ${faltan === 1 ? '1 jugador más' : `${faltan} jugadores más`}…`}
          </p>
        )}
        {queue && (
          <p className="ui-fila-sub" style={{ marginTop: '4px' }}>
            Partidas de {queue.min} a {queue.max} jugadores
          </p>
        )}
      </div>

      {queue && (
        <div className="card ui-filas">
          <p className="kicker" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={13} /> En la cola ({queue.players.length})</p>
          {queue.players.map((name, i) => (
            <div key={`${name}-${i}`} className="ui-fila">
              <span className="ui-fila-icono">{name.charAt(0).toUpperCase()}</span>
              <span className="ui-fila-nombre">{name}</span>
            </div>
          ))}
        </div>
      )}

      {error && <div className="error">{error}</div>}
      <button className="ghost-btn" onClick={() => navigate(publicaPath(game))}>
        <X size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> Cancelar
      </button>
    </PantallaJuego>
  );
}
