import type { ComponentType } from 'react';
import {
  Award, BookOpen, Bot, Brain, BrainCircuit, Layers, Puzzle, CalendarCheck, CalendarHeart, Eye, Grid3x3, Search, Sparkles, CheckCheck, CircleDot, Coins, Crown, Flame, Footprints, Gem, Goal, GraduationCap, Medal,
  Lightbulb, Rocket, ScanSearch, Shirt, Swords, Trophy, UsersRound, Wind, Zap, VenetianMask, Ghost, Fingerprint,
} from 'lucide-react';

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
  // Ahorcado
  redonda_intacta: CircleDot,
  ahorcado_crack: Brain,
  ahorcado_diez: Wind,
  ahorcado_multi: Swords,
  // Trivia
  trivia_perfecta: BookOpen,
  trivia_rapida: Zap,
  trivia_diez: GraduationCap,
  trivia_multi: Lightbulb,
  // Desafío del día
  diaria_perfecta: Sparkles,
  diaria_racha_7: CalendarCheck,
  diaria_racha_30: CalendarHeart,
  // Sopa de letras
  sopa_relampago: Eye,
  sopa_dificil: Grid3x3,
  sopa_diez: Search,
  sopa_multi: ScanSearch,
  // Memotest
  memotest_elefante: BrainCircuit,
  memotest_dificil: Layers,
  memotest_diez: Puzzle,
  memotest_multi: UsersRound,
  // El Impostor
  impostor_multi: VenetianMask,
  impostor_invisible: Ghost,
  impostor_detective: Fingerprint,
};

// Si el backend agrega un logro nuevo antes que el frontend, se muestra con un ícono genérico
export const achievementIcon = (id: string): IconType => ICONS[id] ?? Award;
