import type { ComponentType } from 'react';
import { Award, Bot, CheckCheck, Coins, Crown, Flame, Footprints, Gem, Goal, Medal, Rocket, Shirt, Trophy } from 'lucide-react';

type IconType = ComponentType<{ size?: number; strokeWidth?: number; color?: string }>;

// Ícono de cada logro, por id (los ids están en src/achievements/achievements.definitions.ts del backend)
const ICONS: Record<string, IconType> = {
  debut: Footprints,
  primer_gol: Goal,
  titular: Shirt,
  idolo: Crown,
  goleador: Trophy,
  hat_trick: Flame,
  imparable: Rocket,
  centenario: Coins,
  botin_de_oro: Gem,
  pleno: CheckCheck,
  le_ganaste_a_la_maquina: Bot,
  campeon_del_barrio: Medal,
};

// Si el backend agrega un logro nuevo antes que el frontend, se muestra con un ícono genérico
export const achievementIcon = (id: string): IconType => ICONS[id] ?? Award;
