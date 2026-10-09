import api from './axios';

// Tipos y llamadas del perfil, estadísticas y ranking (backend: /users)

export interface ProfileStats {
  avatar_id: string | null;
  bio: string | null;
  favorite_team: string | null;
  favorite_country: string | null;
  favorite_player: string | null;
  matches_played: number;
  matches_won: number;
  tournaments_won: number;
  total_points: number;
  best_streak: number;
  current_streak: number;
}

export interface MyProfile {
  id: string;
  username: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  birth_date: string | null;
  country: string | null;
  created_at: string;
  profile: ProfileStats | null;
}

export interface ProfileUpdate {
  username?: string;
  bio?: string;
  avatar_id?: string | null;
  favorite_team?: string;
  favorite_country?: string;
  favorite_player?: string;
}

export interface MyRanking {
  position: number;
  totalPlayers: number;
  totalPoints: number;
}

export interface RankingRow {
  position: number;
  userId: string;
  username: string;
  country: string | null;
  avatarId: string | null;
  totalPoints: number;
  matchesPlayed: number;
  matchesWon: number;
  bestStreak: number;
}

export const getMyProfile = () => api.get<MyProfile>('/users/me').then((r) => r.data);
export const updateMyProfile = (data: ProfileUpdate) => api.put<MyProfile>('/users/me', data).then((r) => r.data);
export const getMyRanking = () => api.get<MyRanking>('/users/me/ranking').then((r) => r.data);
export const getRanking = () => api.get<RankingRow[]>('/users/ranking').then((r) => r.data);

export const winRate = (played: number, won: number) => (played > 0 ? Math.round((won / played) * 100) : 0);
