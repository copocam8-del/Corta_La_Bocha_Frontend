import { useCallback, useEffect, useRef, useState } from 'react';
import { emitAck, getSocket } from './socket';
import { clockOffset } from './clock';
import type { Ack, RoomSnapshot, Settings } from './types';

// Si la pantalla de la sala se desmonta y no vuelve a montarse enseguida (ej. el jugador se fue al
// lobby), avisamos al servidor que salió. La espera evita salir por el doble montaje de React en
// desarrollo o por pasar de una pantalla de la sala a otra.
const LEAVE_DELAY_MS = 400;
const pendingLeave = new Map<string, ReturnType<typeof setTimeout>>();

// Conexión a una sala: entra (y vuelve a entrar si se corta la conexión), recibe el estado y
// expone las acciones. El servidor decide todo; acá sólo se manda lo que hace el jugador.
export function useRoom(code: string) {
  const [state, setState] = useState<RoomSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [online, setOnline] = useState(false);
  const offsetRef = useRef(0);

  useEffect(() => {
    const pending = pendingLeave.get(code);
    if (pending) {
      clearTimeout(pending);
      pendingLeave.delete(code);
    }
    const s = getSocket();
    const onState = (snap: RoomSnapshot) => {
      if (snap.code !== code) return;
      offsetRef.current = clockOffset(snap.serverNow, Date.now());
      setState(snap);
    };
    const onConnect = () => {
      setOnline(true);
      void emitAck('room:join', { code }).then((r) => setError(r.ok ? null : r.error));
    };
    const onDisconnect = () => setOnline(false);
    const onConnectError = (err: Error) => setError(err.message || 'No se pudo conectar con el servidor.');

    s.on('room:state', onState);
    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('connect_error', onConnectError);
    if (s.connected) onConnect();

    return () => {
      s.off('room:state', onState);
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
      s.off('connect_error', onConnectError);
      pendingLeave.set(
        code,
        setTimeout(() => {
          pendingLeave.delete(code);
          void emitAck('room:leave', { code });
        }, LEAVE_DELAY_MS),
      );
    };
  }, [code]);

  const run = useCallback(
    async (event: string, payload: object = {}): Promise<Ack> => {
      const res = await emitAck(event, { code, ...payload });
      if (!res.ok) setError(res.error);
      else setError(null);
      return res;
    },
    [code],
  );

  return {
    state,
    error,
    online,
    clearError: () => setError(null),
    offset: () => offsetRef.current,
    updateSettings: (settings: Partial<Settings>) => run('room:settings', { settings }),
    start: () => run('room:start'),
    playAgain: () => run('room:again'),
    leave: () => run('room:leave'),
    sendAnswers: (answers: Record<string, string>, final = false) =>
      emitAck('round:answers', { code, answers, final }),
    basta: (answers: Record<string, string>) => run('round:basta', { answers }),
  };
}

export type RoomApi = ReturnType<typeof useRoom>;
