import type { ComponentType } from 'react';
import Ball from './Ball';
import { Crown, Flag, Flame, Footprints, Goal, Medal, Shield, Shirt, Star, Trophy, Zap } from 'lucide-react';

// Set de avatares propios. Los ids tienen que coincidir con AVATAR_IDS del backend
// (src/users/avatars.ts en Corta_La_Bocha_Backend).

type IconType = ComponentType<{ size?: number; strokeWidth?: number; color?: string }>;

export interface AvatarDef {
  id: string;
  label: string;
  Icon: IconType;
  from: string; // color del degradé
  to: string;
}

export const AVATARS: AvatarDef[] = [
  { id: 'pelota', label: 'Pelota', Icon: Ball, from: '#0fae5d', to: '#39ff8c' },
  { id: 'camiseta', label: 'Camiseta', Icon: Shirt, from: '#2563eb', to: '#60a5fa' },
  { id: 'arco', label: 'Arco', Icon: Goal, from: '#0d9488', to: '#5eead4' },
  { id: 'trofeo', label: 'Trofeo', Icon: Trophy, from: '#ca8a04', to: '#fde047' },
  { id: 'medalla', label: 'Medalla', Icon: Medal, from: '#9333ea', to: '#d8b4fe' },
  { id: 'corona', label: 'Corona', Icon: Crown, from: '#d97706', to: '#fcd34d' },
  { id: 'escudo', label: 'Escudo', Icon: Shield, from: '#1e40af', to: '#facc15' },
  { id: 'estrella', label: 'Estrella', Icon: Star, from: '#db2777', to: '#f9a8d4' },
  { id: 'bandera', label: 'Banderín', Icon: Flag, from: '#0284c7', to: '#e0f2fe' },
  { id: 'rayo', label: 'Rayo', Icon: Zap, from: '#4f46e5', to: '#fde047' },
  { id: 'fuego', label: 'Fuego', Icon: Flame, from: '#dc2626', to: '#fb923c' },
  { id: 'botines', label: 'Botines', Icon: Footprints, from: '#334155', to: '#94a3b8' },
];

export const getAvatar = (id: string | null | undefined) => AVATARS.find((a) => a.id === id);

