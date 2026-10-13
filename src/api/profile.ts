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
  elo?: number; // arranca en 1000
  elo_games?: number; // partidas que movieron el ELO
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
  isAdmin?: boolean; // equipo con acceso al panel /admin (lo decide el backend)
}

export interface ProfileUpdate {
  first_name?: string;
  last_name?: string;
  username?: string;
  bio?: string;
  avatar_id?: string | null;
  favorite_team?: string;
  favorite_country?: string;
  favorite_player?: string;
}

// global = puntos totales · semanal/mensual = partidas del período (hora argentina) · elo = ELO
export type RankingPeriod = 'global' | 'semanal' | 'mensual' | 'elo';

export interface MyRanking {
  period: RankingPeriod;
  from: string | null; // desde cuándo cuenta el período
  position: number | null; // null = todavía no jugó en este período
  totalPlayers: number;
  totalPoints: number;
  matchesPlayed: number;
  matchesWon: number;
  elo: number;
  eloGames: number;
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
  elo: number;
}

export const getMyProfile = () => api.get<MyProfile>('/users/me').then((r) => r.data);
export const updateMyProfile = (data: ProfileUpdate) => api.put<MyProfile>('/users/me', data).then((r) => r.data);
// game: ranking de un juego (sin game = general). El ELO es uno solo.
export const getMyRanking = (period: RankingPeriod = 'global', game?: string) =>
  api.get<MyRanking>('/users/me/ranking', { params: { period, game } }).then((r) => r.data);
export const getRanking = (period: RankingPeriod = 'global', game?: string) =>
  api.get<RankingRow[]>('/users/ranking', { params: { period, game } }).then((r) => r.data);

export const winRate = (played: number, won: number) => (played > 0 ? Math.round((won / played) * 100) : 0);
