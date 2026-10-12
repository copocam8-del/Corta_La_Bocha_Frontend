import { io, type Socket } from 'socket.io-client';
import { getToken } from '../auth/session';
import type { Ack } from './types';

// Una sola conexión de Socket.IO para toda la app, autenticada con el mismo token del login.
// Si se recarga la página, se conecta de nuevo y el servidor la reconoce por el token.
let socket: Socket | null = null;
let socketToken: string | null = null;

const URL = import.meta.env.VITE_WS_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function getSocket(): Socket {
  const token = getToken();
  if (socket && socketToken === token) return socket;
  socket?.disconnect();
  socketToken = token;
  socket = io(URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnectionDelay: 500,
    reconnectionDelayMax: 3000,
  });
  return socket;
}

// Manda un evento y espera la respuesta del servidor ({ ok, error })
export function emitAck(event: string, payload?: unknown, timeoutMs = 8000): Promise<Ack> {
  const s = getSocket();
  return new Promise((resolve) => {
    s.timeout(timeoutMs).emit(event, payload, (err: Error | null, res: Ack) => {
      if (err) resolve({ ok: false, error: 'El servidor no respondió. Revisá tu conexión.' });
      else resolve(res ?? { ok: true });
    });
  });
}
