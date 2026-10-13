import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Avatar, AvatarPicker, hinchaImagen } from './avatars';
import { AVATARS, getAvatar } from './avatarData';
import { buscarHinchas, getHincha, HINCHA_AVATAR_IDS, HINCHAS, nombresDe, ordenarPorClub, varianteDe } from './hinchas';
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
    expect(html).toContain('aria-checked="true" aria-label="Fuego" title="Fuego"');
  });
});

describe('hinchas de clubes', () => {
  it('están todos los de la Liga Profesional 2026, más históricos, Real Madrid y Barcelona (como principal o en "otros")', () => {
    const clubes = HINCHAS.flatMap(nombresDe);
    for (const c of LIGA_PROFESIONAL_2026) expect(clubes).toContain(c);
    for (const c of ['All Boys', 'Chacarita Juniors', 'Nueva Chicago', 'Ferro Carril Oeste', 'Quilmes', 'Almagro', 'Real Madrid', 'Barcelona']) {
      expect(clubes).toContain(c);
    }
    expect(clubes).toHaveLength(45); // los 45 clubes, sin perder ninguno al juntar los repetidos
    expect(new Set(clubes).size).toBe(45); // y cada club en un solo avatar
  });

  it('no hay dos avatares con la misma camiseta (mismo diseño y colores, aunque cambie el fondo)', () => {
    expect(HINCHAS).toHaveLength(29);
    const camiseta = (h: (typeof HINCHAS)[number]) => `${h.diseno}|${[...h.camiseta].join(',')}`;
    expect(new Set(HINCHAS.map(camiseta)).size).toBe(HINCHAS.length);
    // Las mitades rojo y negro son la misma camiseta aunque estén al revés (Newell's y Colón)
    const espejo = (h: (typeof HINCHAS)[number]) => (h.diseno === 'mitades' ? [...h.camiseta].sort().join(',') : camiseta(h));
    expect(new Set(HINCHAS.map(espejo)).size).toBe(HINCHAS.length);
    // Lisas: no puede haber dos con el mismo color principal (ej. blancas o verdes lisas)
    const lisas = HINCHAS.filter((h) => h.diseno === 'lisa').map((h) => h.camiseta[0]);
    expect(new Set(lisas).size).toBe(lisas.length);
  });

  it('los clubes que se juntaron comparten avatar y el buscador los encuentra por cualquier nombre', () => {
    const de = (texto: string) => buscarHinchas(texto).map((h) => h.id);
    expect(de('instituto')).toEqual(['hincha_estudiantes_lp']);
    expect(de('union')).toEqual(['hincha_estudiantes_lp']);
    expect(de('barracas')).toEqual(['hincha_estudiantes_lp']);
    expect(de('tucuman')).toEqual(['hincha_racing']);
    expect(de('colon')).toEqual(['hincha_newells']);
    expect(de('huracan')).toEqual(['hincha_real_madrid']);
    expect(de('sarmiento')).toEqual(['hincha_ferro']);
    expect(de('san martin')).toEqual(['hincha_nueva_chicago']);
    expect(de('godoy')).toEqual(['hincha_talleres']);
    expect(de('atlanta')).toEqual(['hincha_rosario_central']);
    expect(de('argentinos')).toEqual(['hincha_independiente']);
    expect(de('temperley')).toEqual(['hincha_belgrano']);
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

  it('cada club tiene su imagen ilustrada (grande y chiquito); el SVG queda de respaldo', () => {
    for (const h of HINCHAS) {
      const grande = renderToStaticMarkup(<Avatar id={h.id} fallback="x" size={84} />);
      expect(grande).toContain(`Avatar: hincha de ${nombresDe(h).join(', ').replace(/'/g, '&#x27;')}`);
      expect(grande).toContain(`src="${hinchaImagen(h.id)}"`);
      expect(grande).toContain('alt=""'); // el nombre va en el aria-label del contenedor
      expect(grande).toContain(h.fondo);
      expect(renderToStaticMarkup(<Avatar id={h.id} fallback="x" size={26} />)).toContain(`src="${hinchaImagen(h.id)}"`);
    }
  });

  it('hay una imagen por hincha en public/avatars/hinchas y ninguna de más', () => {
    // Sin eager: sólo lista los archivos, no los importa (lo que está en public/ no se importa desde JS)
    const archivos = Object.keys(import.meta.glob('../../public/avatars/hinchas/*.webp')).map((p) => p.split('/').pop()).sort();
    expect(archivos).toEqual(HINCHA_AVATAR_IDS.map((id) => `${id}.webp`).sort());
  });

  it('cada club tiene dos poses: el id del club y el mismo + "_2"', () => {
    expect(HINCHA_AVATAR_IDS).toHaveLength(HINCHAS.length * 2);
    for (const id of HINCHA_AVATAR_IDS) expect(id.length).toBeLessThanOrEqual(30);
    expect(getHincha('hincha_boca_2')?.club).toBe('Boca Juniors');
    expect(getHincha('hincha_boca')?.club).toBe('Boca Juniors');
    expect(getHincha('pelota_2')).toBeUndefined();
    const html = renderToStaticMarkup(<Avatar id="hincha_boca_2" fallback="x" size={84} />);
    expect(html).toContain(`src="${hinchaImagen('hincha_boca_2')}"`);
    expect(html).toContain('data-avatar="hincha_boca_2"');
    const picker = renderToStaticMarkup(<AvatarPicker value="hincha_river_2" onChange={() => {}} />);
    expect(picker.match(/aria-checked="true"/g)).toHaveLength(1);
    expect(picker.match(/role="radio"/g)!.length).toBe(12 + HINCHA_AVATAR_IDS.length); // 12 clásicos + 2 por club
  });

  it('ningún dibujo tiene texto (ni nombres de clubes, ni números, ni marcas)', () => {
    for (const h of HINCHAS) {
      for (const size of [26, 84]) {
        const svg = renderToStaticMarkup(<HinchaSvg hincha={h} size={size} />);
        expect(svg).not.toMatch(/<(text|tspan|textPath|title|desc|foreignObject|image)\b/);
        expect(svg.replace(/<[^>]*>/g, '').trim()).toBe(''); // sin texto entre las etiquetas
        for (const n of nombresDe(h)) expect(svg).not.toContain(n);
      }
    }
  });

  it('no son todos iguales: poses, caras, tonos de piel, pelos, barba/bigote y accesorios', () => {
    const v = HINCHAS.map((h) => varianteDe(h.id));
    expect(new Set(v.map((x) => x.pose)).size).toBe(6);
    expect(new Set(v.map((x) => x.espejo)).size).toBe(2);
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
        for (const n of nombresDe(h)) expect(svg.toLowerCase()).not.toContain(n.toLowerCase());
      }
      const avatar = renderToStaticMarkup(<Avatar id={h.id} fallback="Lionel" size={84} />);
      expect(avatar.replace(/<[^>]*>/g, '')).toBe(''); // el nombre va sólo en aria-label, no se dibuja
    }
  });

  it('sin gorro: el personaje no tiene piluso', () => {
    for (const h of HINCHAS) expect(Object.keys(h)).not.toContain('piluso');
  });

  it('el vaso es de fernet con coca: bebida casi negra con espuma clara', () => {
    const svg = renderToStaticMarkup(<HinchaSvg hincha={HINCHAS[0]} size={84} />);
    expect(svg).toContain('#120705'); // bebida
    expect(svg).toContain('#f3e8cf'); // espuma
  });

  it('el selector tiene la sección Clubes, alfabética, con el nombre debajo y buscador', () => {
    const html = renderToStaticMarkup(<AvatarPicker value="hincha_boca" onChange={() => {}} />);
    expect(html).toContain('Clubes');
    expect(html).toContain('Buscá tu club');
    expect(html.indexOf('Aldosivi')).toBeLessThan(html.indexOf('Vélez Sarsfield'));
    expect(html.match(/aria-checked="true"/g)).toHaveLength(1);
    expect(buscarHinchas('velez').map((h) => h.club)).toEqual(['Vélez Sarsfield']);
    expect(buscarHinchas('GIMNASIA').length).toBe(2); // La Plata y Mendoza (con Central Córdoba)
    // Los nombres (club y "otros") van en title y aria-label, para accesibilidad…
    expect(html).toContain('aria-label="Estudiantes (La Plata) · Instituto · Unión (Santa Fe) · Barracas Central"');
    expect(html).toContain('title="Real Madrid · Huracán · Quilmes · All Boys"');
    expect(buscarHinchas('').length).toBe(HINCHAS.length);
  });
});

describe('selector de hinchas: sólo el avatar', () => {
  it('no muestra el nombre del club ni los "otros" debajo de la miniatura (sólo el avatar)', () => {
    const html = renderToStaticMarkup(<AvatarPicker value={null} onChange={() => {}} />);
    const grilla = html.slice(html.lastIndexOf('<div', html.indexOf('data-testid="clubes"')));
    const textoVisible = grilla.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    expect(textoVisible).toBe(''); // ningún texto dibujado en la grilla de clubes
    expect(html).not.toContain('otros-clubes');
    for (const h of HINCHAS) {
      expect(grilla).toContain(`aria-label="${nombresDe(h).join(' · ').replace(/'/g, '&#x27;')}"`);
    }
  });

  it('el buscador sigue encontrando por el club y por los "otros"', () => {
    expect(buscarHinchas('boca').map((h) => h.id)).toEqual(['hincha_boca']);
    expect(buscarHinchas('quilmes').map((h) => h.id)).toEqual(['hincha_real_madrid']);
    expect(renderToStaticMarkup(<AvatarPicker value={null} onChange={() => {}} />)).toContain('Buscá tu club');
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
