import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Users, X } from 'lucide-react';
import MultiShell from '../multi/MultiShell';
import { emitAck, getSocket } from '../multi/socket';
import { clockOffset, secondsUntil } from '../multi/clock';
import { useNow } from '../multi/useNow';
import { temaLabel, type QueueState } from '../multi/types';

// Cola pública: el servidor junta jugadores con la misma temática y tamaño de partida. Cuando hay
// suficientes, arma la sala y nos manda el código ("queue:matched"): vamos directo a la partida.
export default function PublicQueue() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tematica, size } = (location.state || {}) as { tematica?: string; size?: 'pocos' | 'muchos' };
  const [queue, setQueue] = useState<QueueState | null>(null);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const now = useNow(!!queue?.startsAt);

  useEffect(() => {
    if (!tematica || !size) return;
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
    const join = () => void emitAck('queue:join', { tematica, size }).then((r) => setError(r.ok ? null : r.error));
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
  }, [tematica, size, navigate]);

  if (!tematica || !size) {
    navigate('/public-setup');
    return null;
  }

  const faltan = queue ? Math.max(0, queue.min - queue.players.length) : null;

  return (
    <MultiShell maxWidth={460}>
      <div style={{ textAlign: 'center' }}>
        <p className="kicker">Partida pública · {temaLabel(tematica)}</p>
        <h1 className="neon-title" style={{ fontSize: '26px', marginTop: '6px' }}>Buscando rivales</h1>
      </div>

      <div className="card pulse" style={{ textAlign: 'center' }} data-testid="cola">
        <Search size={26} color="#39ff8c" style={{ animation: 'pulse 1.4s ease-in-out infinite' }} />
        {queue?.startsAt ? (
          <p style={{ marginTop: '10px', fontSize: '14px' }}>
            ¡Ya hay partida! Arranca en <strong style={{ color: '#39ff8c' }}>{secondsUntil(queue.startsAt, offset, now)} s</strong> (pueden sumarse más)
          </p>
        ) : (
          <p style={{ marginTop: '10px', fontSize: '14px', color: 'rgba(180,255,205,0.8)' }}>
            {faltan === null ? 'Entrando a la cola…' : `Esperando ${faltan === 1 ? '1 jugador más' : `${faltan} jugadores más`}…`}
          </p>
        )}
        {queue && (
          <p style={{ marginTop: '4px', fontSize: '12px', color: 'rgba(180,255,205,0.5)' }}>
            Partidas de {queue.min} a {queue.max} jugadores
          </p>
        )}
      </div>

      {queue && (
        <div className="card">
          <p className="section-label"><Users size={12} /> En la cola ({queue.players.length})</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {queue.players.map((name, i) => (
              <div key={`${name}-${i}`} className="player-row">
                <div className="avatar">{name.charAt(0).toUpperCase()}</div>
                <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '14px' }}>{name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <div className="error">{error}</div>}
      <button className="ghost-btn" onClick={() => navigate('/public-setup')}>
        <X size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> Cancelar
      </button>
    </MultiShell>
  );
}
