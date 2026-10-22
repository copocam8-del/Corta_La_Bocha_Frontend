import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import GameMenu from '../../pages/GameMenu';
import ImpostorPresencial, { Final, PasarCelu, Pistas, Revelacion } from '../../pages/ImpostorPresencial';
import { menuOnlinePath, menuPath } from '../multiConfig';
import {
  armarRondas, elegirImpostor, errorNombre, guardarNombres, leerNombresGuardados, limpiarNombre, MAX_JUGADORES, ordenPistas,
  type RondaEnPersona,
} from './presencial';

// El Impostor "En persona": el menú "¿Cómo juegan?", las reglas que corren en el navegador y las pantallas.

const menu = (url: string) =>
  renderToStaticMarkup(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/juego/:game" element={<GameMenu />} />
        <Route path="/juego/:game/online" element={<GameMenu online />} />
      </Routes>
    </MemoryRouter>,
  );

describe('menú del Impostor: "¿Cómo juegan?"', () => {
  it('primero En persona u Online (todavía sin salas)', () => {
    const html = menu('/juego/impostor');
    expect(html).toContain('¿Cómo juegan?');
    expect(html).toContain('data-testid="modo-en-persona"');
    expect(html).toContain('Un solo celular que se pasan');
    expect(html).toContain('data-testid="modo-online"');
    expect(html).toContain('Cada uno desde su casa');
    expect(html).not.toContain('Crear sala privada');
  });

  it('Online es lo de siempre: con amigos (crear / unirse) y partida pública', () => {
    const html = menu('/juego/impostor/online');
    expect(html).toContain('Crear sala privada');
    expect(html).toContain('Unirse con código');
    expect(html).toContain('Partida pública');
    expect(html).not.toContain('data-testid="modo-en-persona"');
    expect(html).not.toContain('data-testid="modo-solo"');
  });

  it('los demás juegos no cambian (y no tienen /online)', () => {
    expect(menu('/juego/trivia')).toContain('Jugar solo');
    expect(menu('/juego/trivia')).not.toContain('¿Cómo juegan?');
    expect(menu('/juego/trivia/online')).toBe('');
    expect(menuOnlinePath('trivia')).toBe(menuPath('trivia'));
    expect(menuOnlinePath('impostor')).toBe('/juego/impostor/online');
  });
});

describe('reglas en persona', () => {
  it('nombres: sin vacíos, máximo 20, sin repetidos (sin tildes ni mayúsculas) y hasta 12', () => {
    expect(limpiarNombre('  Ana   Paula ')).toBe('Ana Paula');
    expect(errorNombre('   ', [])).toBe('Escribí un nombre.');
    expect(errorNombre('x'.repeat(21), [])).toContain('20');
    expect(errorNombre('x'.repeat(20), [])).toBeNull();
    expect(errorNombre(' agus ', ['Agus'])).toBe('Ese nombre ya está.');
    expect(errorNombre('Ágús', ['agus'])).toBe('Ese nombre ya está.');
    const doce = Array.from({ length: MAX_JUGADORES }, (_, i) => `J${i}`);
    expect(errorNombre('Otro', doce)).toContain('12');
  });

  it('el impostor rota: el que menos veces fue tiene prioridad', () => {
    for (let i = 0; i < 20; i++) expect(elegirImpostor([1, 0, 1], Math.random)).toBe(1);
    const rondas = armarRondas(3, Array.from({ length: 6 }, (_, i) => ({ texto: `P${i}`, categoria: 'Jugador' })));
    const veces = [0, 0, 0];
    for (const r of rondas) veces[r.impostor] += 1;
    expect(veces).toEqual([2, 2, 2]); // en 6 rondas con 3, a cada uno le toca 2 veces
  });

  it('no es siempre el mismo: con azar distinto cambia el impostor', () => {
    const palabras = [{ texto: 'Riquelme', categoria: 'Jugador' }];
    const primeros = new Set(Array.from({ length: 40 }, () => armarRondas(5, palabras)[0].impostor));
    expect(primeros.size).toBeGreaterThan(1);
  });

  it('cada ronda tiene su palabra, su número y quién empieza', () => {
    const [r] = armarRondas(4, [{ texto: 'La Bombonera', categoria: 'Estadio' }], () => 0.99);
    expect(r).toEqual({ numero: 1, palabra: 'La Bombonera', categoria: 'Estadio', impostor: 3, empieza: 3 });
  });

  it('pistas: dos vueltas en ronda, arrancando por el que empieza', () => {
    expect(ordenPistas(4, 2)).toEqual([[2, 3, 0, 1], [2, 3, 0, 1]]);
  });

  describe('nombres guardados en este celular', () => {
    afterEach(() => vi.unstubAllGlobals());
    const memoria = () => {
      const datos = new Map<string, string>();
      return { getItem: (k: string) => datos.get(k) ?? null, setItem: (k: string, v: string) => void datos.set(k, v) };
    };

    it('guarda y lee los últimos nombres', () => {
      vi.stubGlobal('localStorage', memoria());
      guardarNombres(['Ana', 'Beto', 'Caro']);
      expect(leerNombresGuardados()).toEqual(['Ana', 'Beto', 'Caro']);
    });

    it('si localStorage falla o tiene basura, arranca vacío (nunca rompe)', () => {
      vi.stubGlobal('localStorage', { getItem: () => { throw new Error('bloqueado'); }, setItem: () => { throw new Error('lleno'); } });
      expect(() => guardarNombres(['Ana'])).not.toThrow();
      expect(leerNombresGuardados()).toEqual([]);
      const m = memoria();
      vi.stubGlobal('localStorage', m);
      m.setItem('impostor-en-persona-nombres', '{"no":"lista"}');
      expect(leerNombresGuardados()).toEqual([]);
      m.setItem('impostor-en-persona-nombres', JSON.stringify(['Ana', 'ana', 5, '', 'x'.repeat(30), 'Beto']));
      expect(leerNombresGuardados()).toEqual(['Ana', 'Beto']);
    });
  });
});

describe('pantallas en persona', () => {
  const ronda: RondaEnPersona = { numero: 1, palabra: 'Riquelme', categoria: 'Jugador', impostor: 2, empieza: 1 };
  const jugadores = ['Ana', 'Beto', 'Caro'];
  const nada = () => {};
  const pasar = (esImpostor: boolean, viendo: boolean) =>
    renderToStaticMarkup(<PasarCelu ronda={ronda} total={3} nombre="Caro" esImpostor={esImpostor} viendo={viendo} onVer={nada} onTapar={nada} />);

  it('preparación: nombres, temática, rondas y ¡Jugar! (deshabilitado con menos de 3)', () => {
    const html = renderToStaticMarkup(<MemoryRouter><ImpostorPresencial /></MemoryRouter>);
    expect(html).toContain('¿Quiénes juegan?');
    expect(html).toContain('maxLength="20"');
    expect(html).toContain('Mezcla');
    expect(html).toContain('Selecciones');
    expect(html).toContain('Faltan 3 jugadores');
    expect(html).toMatch(/data-testid="ep-jugar"[^>]*disabled/);
  });

  it('"Pasale el celu a…": antes de tocar "Ver mi palabra" no aparece ninguna palabra', () => {
    const html = pasar(false, false);
    expect(html).toContain('Pasale el celu a');
    expect(html).toContain('Caro');
    expect(html).toContain('Ver mi palabra');
    expect(html).not.toContain('Riquelme');
    expect(html).not.toContain('Jugador');
    expect(pasar(true, false)).not.toContain('impostor');
  });

  it('el grupo ve la palabra grande; el impostor ve "Sos el impostor" y sólo la categoría', () => {
    const grupo = pasar(false, true);
    expect(grupo).toContain('Riquelme');
    expect(grupo).toContain('Listo, tapar');
    expect(grupo).not.toContain('Sos el impostor');
    const impostor = pasar(true, true);
    expect(impostor).toContain('Sos el impostor');
    expect(impostor).toContain('Jugador');
    expect(impostor).not.toContain('Riquelme');
  });

  it('pistas: quién empieza y el orden de las dos vueltas', () => {
    const html = renderToStaticMarkup(<Pistas ronda={ronda} total={3} jugadores={jugadores} onVotar={nada} />);
    expect(html).toMatch(/data-testid="ep-empieza">Beto</);
    expect(html).toContain('Vuelta 1');
    expect(html).toContain('Vuelta 2');
    expect(html).toContain('¡A votar!');
    expect(html).not.toContain('Riquelme');
  });

  it('revelación: quién era el impostor y la palabra; en la última, "Ver el final"', () => {
    const html = renderToStaticMarkup(<Revelacion ronda={ronda} jugadores={jugadores} ultima={false} onSiguiente={nada} />);
    expect(html).toContain('El impostor era');
    expect(html).toContain('Caro');
    expect(html).toContain('Riquelme');
    expect(html).toContain('Siguiente ronda');
    expect(renderToStaticMarkup(<Revelacion ronda={ronda} jugadores={jugadores} ultima onSiguiente={nada} />)).toContain('Ver el final');
  });

  it('final: palabra e impostor de cada ronda y "Jugar de nuevo"', () => {
    const rondas = [ronda, { numero: 2, palabra: 'Boca Juniors', categoria: 'Equipo', impostor: 0, empieza: 0 }];
    const html = renderToStaticMarkup(<Final rondas={rondas} jugadores={jugadores} cargando={false} error={null} onDeNuevo={nada} onCambiar={nada} />);
    for (const t of ['Ronda 1', 'Riquelme', 'Caro', 'Ronda 2', 'Boca Juniors', 'Ana', 'Jugar de nuevo']) expect(html).toContain(t);
  });
});
