import api from './axios';

// Logros (backend: GET /users/me/achievements). Nombre y descripción vienen del backend.

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

// Logro recién desbloqueado (viene en la respuesta al terminar una partida)
export interface NewAchievement {
  id: string;
  name: string;
  description: string;
}

export const getMyAchievements = () => api.get<Achievement[]>('/users/me/achievements').then((r) => r.data);
