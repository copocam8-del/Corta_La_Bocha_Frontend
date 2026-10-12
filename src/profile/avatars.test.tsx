import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Avatar, AvatarPicker } from './avatars';
import { AVATARS, getAvatar } from './avatarData';
import { buscarHinchas, HINCHAS, ordenarPorClub, varianteDe } from './hinchas';
import HinchaSvg from './Hincha';
import { winRate } from '../api/profile';
import { getTokenUserId } from '../auth/session';

// Mismos ids que BASE_AVATAR_IDS del backend (src/users/avatars.ts)
const BACKEND_AVATAR_IDS = [
  'pelota', 'camiseta', 'arco', 'trofeo', 'medalla', 'corona',
  'escudo', 'estrella', 'bandera', 'rayo', 'fuego', 'botines',
];

// Clubes de la Liga Profesional 2026 (tienen que estar todos)
const LIGA_PROFESIONAL_2026 = [
  'Aldosivi', 'Argentinos Juniors', 'Atlético Tucumán', 'Banfield', 'Barracas Central', 'Belgrano', 'Boca Juniors',
  'Central Córdoba (SdE)', 'Defensa y Justicia', 'Deportivo Riestra', 'Estudiantes (La Plata)', 'Estudiantes (Río Cuarto)',
  'Gimnasia (La Plata)', 'Gimnasia (Mendoza)', 'Huracán', 'Independiente', 'Independiente Rivadavia', 'Instituto', 'Lanús',
  "Newell's Old Boys", 'Platense', 'Racing Club', 'River Plate', 'Rosario Central', 'San Lorenzo', 'Sarmiento (Junín)',
  'Talleres (Córdoba)', 'Tigre', 'Unión (Santa Fe)', 'Vélez Sarsfield',
];

describe('avatares', () => {
  it('los clásicos coinciden con los del backend', () => {
    expect(AVATARS.map((a) => a.id)).toEqual(BACKEND_AVATAR_IDS);
  });

  // Si el repo del backend está al lado (como en la compu del equipo), los ids de los hinchas tienen que ser los mismos
  // (import.meta.glob devuelve {} si el archivo no existe, ej. en un CI con un solo repo)
  const back = Object.values(import.meta.glob('../../../Corta_La_Bocha_Backend/src/users/avatars.ts', { query: '?raw', import: 'default', eager: true }))[0] as string | undefined;
  it.skipIf(!back)('los ids de los hinchas coinciden con CLUB_AVATAR_IDS del backend', () => {
    const texto = back!;
    const bloque = texto.slice(texto.indexOf('CLUB_AVATAR_IDS'), texto.indexOf('] as const', texto.indexOf('CLUB_AVATAR_IDS')));
    const ids = [...bloque.matchAll(/'(hincha_[a-z0-9_]+)'/g)].map((m) => m[1]);
    expect(ids).toEqual(HINCHAS.map((h) => h.id));
  });

  it('todos tienen nombre en español y no se repiten', () => {
    expect(new Set(AVATARS.map((a) => a.id)).size).toBe(AVATARS.length);
    for (const a of AVATARS) expect(a.label.length).toBeGreaterThan(2);
  });

  it('sin avatar elegido muestra la inicial', () => {
    expect(getAvatar(null)).toBeUndefined();
    expect(renderToStaticMarkup(<Avatar id={null} fallback="lionel" />)).toContain('>L<');
  });

  it('con avatar elegido lo describe para lectores de pantalla', () => {
    expect(renderToStaticMarkup(<Avatar id="trofeo" fallback="x" />)).toContain('Avatar: Trofeo');
  });

  it('el selector marca el avatar elegido', () => {
    const html = renderToStaticMarkup(<AvatarPicker value="fuego" onChange={() => {}} />);
    expect(html.match(/aria-checked="true"/g)).toHaveLength(1);
    expect(html).toContain('aria-checked="true" title="Fuego"');
  });
});

describe('hinchas de clubes', () => {
  it('están todos los de la Liga Profesional 2026, más históricos, Real Madrid y Barcelona', () => {
    const clubes = HINCHAS.map((h) => h.club);
    for (const c of LIGA_PROFESIONAL_2026) expect(clubes).toContain(c);
    expect(HINCHAS.filter((h) => h.liga === 'lpf').map((h) => h.club).sort()).toEqual([...LIGA_PROFESIONAL_2026].sort());
    for (const c of ['All Boys', 'Chacarita Juniors', 'Nueva Chicago', 'Ferro Carril Oeste', 'Quilmes', 'Almagro', 'Real Madrid', 'Barcelona']) {
      expect(clubes).toContain(c);
    }
  });

  it('ids únicos que entran en la base (máx. 30), en orden alfabético y con colores válidos', () => {
    expect(new Set(HINCHAS.map((h) => h.id)).size).toBe(HINCHAS.length);
    expect(HINCHAS.map((h) => h.id)).toEqual(ordenarPorClub(HINCHAS).map((h) => h.id));
    const color = /^#[0-9a-f]{6}$/i;
    for (const h of HINCHAS) {
      expect(h.id).toMatch(/^hincha_[a-z0-9_]+$/);
      expect(h.id.length).toBeLessThanOrEqual(30);
      for (const c of [...h.camiseta, h.short, h.medias, h.fondo]) expect(c).toMatch(color);
      expect(h.fondo).not.toBe(h.camiseta[0]); // el fondo contrasta con la camiseta
    }
  });

  it('cada club tiene un avatar que se dibuja (grande y chiquito)', () => {
    for (const h of HINCHAS) {
      const grande = renderToStaticMarkup(<Avatar id={h.id} fallback="x" size={84} />);
      expect(grande).toContain(`Avatar: hincha de ${h.club.replace("'", '&#x27;')}`);
      expect(grande).toContain('<svg');
      expect(grande).toContain(h.fondo);
      expect(renderToStaticMarkup(<Avatar id={h.id} fallback="x" size={26} />)).toContain('<svg');
    }
  });

  it('ningún dibujo tiene texto (ni nombres de clubes, ni números, ni marcas)', () => {
    for (const h of HINCHAS) {
      for (const size of [26, 84]) {
        const svg = renderToStaticMarkup(<HinchaSvg hincha={h} size={size} />);
        expect(svg).not.toMatch(/<(text|tspan|textPath|title|desc|foreignObject|image)\b/);
        expect(svg.replace(/<[^>]*>/g, '').trim()).toBe(''); // sin texto entre las etiquetas
        expect(svg).not.toContain(h.club);
      }
    }
  });

  it('no son todos iguales: poses, caras, tonos de piel, pelos, barba/bigote y accesorios', () => {
    const v = HINCHAS.map((h) => varianteDe(h.id));
    expect(new Set(v.map((x) => x.pose)).size).toBe(4);
    expect(new Set(v.map((x) => x.cara)).size).toBe(3);
    expect(new Set(v.map((x) => x.piel)).size).toBe(4);
    expect(new Set(v.map((x) => x.pelo)).size).toBe(4);
    expect(new Set(v.map((x) => x.vello)).size).toBe(3);
    expect(new Set(v.map((x) => x.accesorio)).size).toBe(3);
  });

  it('ningún SVG tiene texto: ningún hincha, en ningún tamaño, ni el avatar completo', () => {
    for (const h of HINCHAS) {
      for (const size of [20, 26, 36, 47, 48, 60, 84, 104]) {
        const svg = renderToStaticMarkup(<HinchaSvg hincha={h} size={size} />);
        expect(svg.startsWith('<svg')).toBe(true);
        // ni elementos de texto…
        expect(svg).not.toMatch(/<(text|tspan|textPath|title|desc|foreignObject|image|use|a)[\s>/]/);
        // …ni texto suelto entre etiquetas
        expect(svg.replace(/<[^>]*>/g, '')).toBe('');
        // …ni el nombre del club escondido en algún atributo
        expect(svg.toLowerCase()).not.toContain(h.club.toLowerCase());
      }
      const avatar = renderToStaticMarkup(<Avatar id={h.id} fallback="Lionel" size={84} />);
      expect(avatar.replace(/<[^>]*>/g, '')).toBe(''); // el nombre va sólo en aria-label, no se dibuja
    }
  });

  it('sin gorro: el personaje nuevo no tiene piluso', () => {
    for (const h of HINCHAS) expect(Object.keys(h)).not.toContain('piluso');
  });

  it('el selector tiene la sección Clubes, alfabética, con el nombre debajo y buscador', () => {
    const html = renderToStaticMarkup(<AvatarPicker value="hincha_boca" onChange={() => {}} />);
    expect(html).toContain('Clubes');
    expect(html).toContain('Buscá tu club');
    expect(html.indexOf('Aldosivi')).toBeLessThan(html.indexOf('Vélez Sarsfield'));
    expect(html.match(/aria-checked="true"/g)).toHaveLength(1);
    expect(buscarHinchas('velez').map((h) => h.club)).toEqual(['Vélez Sarsfield']);
    expect(buscarHinchas('GIMNASIA').length).toBe(2);
    expect(buscarHinchas('').length).toBe(HINCHAS.length);
  });
});

describe('estadísticas', () => {
  it('calcula el porcentaje de victorias sin dividir por cero', () => {
    expect(winRate(0, 0)).toBe(0);
    expect(winRate(3, 2)).toBe(67);
  });
});

describe('getTokenUserId', () => {
  const b64url = (o: object) => btoa(JSON.stringify(o)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  it('lee el id del usuario del token', () => {
    expect(getTokenUserId(`${b64url({ alg: 'HS256' })}.${b64url({ sub: 'u-123' })}.firma`)).toBe('u-123');
  });

  it('devuelve null si no hay token o está roto', () => {
    expect(getTokenUserId(null)).toBeNull();
    expect(getTokenUserId('basura')).toBeNull();
  });
});
