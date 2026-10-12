import api from './axios';
import type { Settings } from '../multi/types';

// Salas del multijugador. Por HTTP sólo se crea la sala y se consulta si existe; el juego va por
// Socket.IO (src/multi/).

export const createRoom = (settings: Settings) =>
  api.post<{ code: string }>('/rooms', settings).then((r) => r.data);

export interface RoomSummary {
  code: string;
  isPrivate: boolean;
  status: string;
  players: number;
  maxPlayers: number;
}

export const getRoom = (code: string) => api.get<RoomSummary>(`/rooms/${encodeURIComponent(code)}`).then((r) => r.data);
