import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Award } from 'lucide-react';
import AchievementsGrid from './AchievementsGrid';
import { achievementIcon } from './achievementIcons';
import type { Achievement } from '../api/achievements';

// Ids definidos en el backend (src/achievements/achievements.definitions.ts)
const BACKEND_IDS = [
  'debut', 'primer_gol', 'titular', 'idolo', 'goleador', 'hat_trick',
  'imparable', 'centenario', 'botin_de_oro', 'pleno', 'le_ganaste_a_la_maquina', 'campeon_del_barrio',
];

const logro = (id: string, unlocked: boolean): Achievement => ({
  id, name: `Logro ${id}`, description: `Descripción de ${id}.`, unlocked,
  unlockedAt: unlocked ? '2026-10-08T12:00:00Z' : null,
});

describe('logros', () => {
  it('todos los logros del backend tienen ícono propio', () => {
    for (const id of BACKEND_IDS) expect(achievementIcon(id)).not.toBe(Award);
  });

  it('un logro desconocido usa un ícono genérico (no rompe)', () => {
    expect(achievementIcon('logro_futuro')).toBe(Award);
  });

  it('los bloqueados se ven en gris y se anuncian como bloqueados', () => {
    const html = renderToStaticMarkup(<AchievementsGrid achievements={[logro('debut', true), logro('idolo', false)]} />);
    expect(html).toContain('Logro debut: Descripción de debut. Desbloqueado.');
    expect(html).toContain('Logro idolo: Descripción de idolo. Bloqueado.');
    expect(html.match(/grayscale\(1\)/g)).toHaveLength(1);
  });
});
