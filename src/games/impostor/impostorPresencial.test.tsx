import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import GameMenu from '../../pages/GameMenu';
import ImpostorPresencial, { Configuracion, Final, HojaJugadores, PasarCelu, Pistas, Revelacion, Votar } from '../../pages/ImpostorPresencial';
import { ComoJugar } from './ImpostorUI';
import { COMO_JUGAR_EN_PERSONA } from './estilo';
import { menuOnlinePath, menuPath } from '../multiConfig';
import {
  ajustarImpostores, armarRondas, elegirImpostor, elegirImpostores, errorNombre, guardarAjustes, guardarNombres, leerAjustes,
  leerNombresGuardados, limpiarNombre, MAX_JUGADORES, maxImpostores, ordenPistas, secretoDe, type RondaEnPersona,
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
  it('primero En persona u Online (dos tarjetas grandes, todavía sin salas)', () => {
    const html = menu('/juego/impostor');
    expect(html).toContain('¿Cómo juegan?');
    expect(html).toContain('data-testid="modo-en-persona"');
    expect(html).toContain('Un solo celular que se pasan');
    expect(html).toContain('data-testid="modo-online"');
    expect(html).toContain('Cada uno desde su casa');
    expect(html).toContain('/avatars/impostor/hincha_'); // ilustración con nuestros hinchas (recortados)
    expect(html).toContain('data-testid="volver"'); // el botón Volver de siempre
    expect(html).toContain('aria-label="Cómo jugar"');
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
    for (const r of rondas) for (const i of r.impostores) veces[i] += 1;
    expect(veces).toEqual([2, 2, 2]); // en 6 rondas con 3, a cada uno le toca 2 veces
  });

  it('no es siempre el mismo: con azar distinto cambia el impostor', () => {
    const palabras = [{ texto: 'Riquelme', categoria: 'Jugador' }];
    const primeros = new Set(Array.from({ length: 40 }, () => armarRondas(5, palabras)[0].impostores[0]));
    expect(primeros.size).toBeGreaterThan(1);
  });

  it('cada ronda tiene su palabra, su número, sus impostores y quién empieza', () => {
    const [r] = armarRondas(4, [{ texto: 'La Bombonera', categoria: 'Estadio' }], 1, () => 0.99);
    expect(r).toEqual({ numero: 1, palabra: 'La Bombonera', categoria: 'Estadio', impostores: [3], empieza: 3 });
  });

  it('cuántos impostores: 1 con 3-4 jugadores, 2 con 5-7, 3 con 8 o más (mínimo 1)', () => {
    expect([3, 4, 5, 7, 8, 12].map(maxImpostores)).toEqual([1, 1, 2, 2, 3, 3]);
    expect(ajustarImpostores(3, 4)).toBe(1); // sacaron jugadores: baja solo
    expect(ajustarImpostores(0, 8)).toBe(1);
    expect(ajustarImpostores(2, 6)).toBe(2);
    expect(ajustarImpostores(5, 12)).toBe(3);
  });

  it('varios impostores: siempre distintos en la misma ronda', () => {
    for (let k = 0; k < 50; k++) {
      const elegidos = elegirImpostores([0, 0, 0, 0, 0, 0, 0, 0], 3);
      expect(new Set(elegidos).size).toBe(3);
      expect(elegidos).toEqual([...elegidos].sort((a, b) => a - b));
    }
    // Aunque pidan de más, nunca se repite ni pasa la cantidad de jugadores
    expect(elegirImpostores([0, 0, 0], 5)).toEqual([0, 1, 2]);
  });

  it('rotación con varios impostores: le toca a todos lo mismo', () => {
    const palabras = (n: number) => Array.from({ length: n }, (_, i) => ({ texto: `P${i}`, categoria: 'Jugador' }));
    const veces = (jugadores: number, rondas: RondaEnPersona[]) => {
      const v = Array.from({ length: jugadores }, () => 0);
      for (const r of rondas) for (const i of r.impostores) v[i] += 1;
      return v;
    };
    // 6 jugadores, 2 impostores, 3 rondas → cada uno exactamente una vez
    const seis = armarRondas(6, palabras(3), 2);
    expect(seis.every((r) => r.impostores.length === 2)).toBe(true);
    expect(veces(6, seis)).toEqual([1, 1, 1, 1, 1, 1]);
    // 8 jugadores, 3 impostores, 8 rondas → cada uno 3 veces
    expect(veces(8, armarRondas(8, palabras(8), 3))).toEqual(Array(8).fill(3));
    // Con 4 jugadores no puede haber 2: queda en 1
    expect(armarRondas(4, palabras(2), 2).every((r) => r.impostores.length === 1)).toBe(true);
  });

  it('pista para el impostor: prendida ve la categoría, apagada no ve nada; nunca la palabra', () => {
    const r: RondaEnPersona = { numero: 1, palabra: 'Riquelme', categoria: 'Jugador', impostores: [0, 2], empieza: 1 };
    expect(secretoDe(r, 0, true)).toEqual({ rol: 'impostor', categoria: 'Jugador', companeros: 1 });
    expect(secretoDe(r, 2, false)).toEqual({ rol: 'impostor', categoria: null, companeros: 1 });
    expect(JSON.stringify(secretoDe(r, 0, true))).not.toContain('Riquelme');
    expect(secretoDe(r, 1, false)).toEqual({ rol: 'hincha', palabra: 'Riquelme', categoria: 'Jugador' });
  });

  it('pistas: dos vueltas en ronda, arrancando por el que empieza', () => {
    expect(ordenPistas(4, 2)).toEqual([[2, 3, 0, 1], [2, 3, 0, 1]]);
  });

  describe('lo que se guarda en este celular', () => {
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

    it('guarda y lee los ajustes (impostores y pista); con basura o sin localStorage, los de siempre', () => {
      const m = memoria();
      vi.stubGlobal('localStorage', m);
      expect(leerAjustes()).toEqual({ impostores: 1, pista: true });
      guardarAjustes({ impostores: 2, pista: false });
      expect(leerAjustes()).toEqual({ impostores: 2, pista: false });
      m.setItem('impostor-en-persona-ajustes', JSON.stringify({ impostores: 9, pista: 'si' }));
      expect(leerAjustes()).toEqual({ impostores: 1, pista: true });
      vi.stubGlobal('localStorage', { getItem: () => { throw new Error('bloqueado'); }, setItem: () => { throw new Error('lleno'); } });
      expect(() => guardarAjustes({ impostores: 2, pista: true })).not.toThrow();
      expect(leerAjustes()).toEqual({ impostores: 1, pista: true });
    });
  });
});

describe('pantallas en persona', () => {
  const ronda: RondaEnPersona = { numero: 1, palabra: 'Riquelme', categoria: 'Jugador', impostores: [2], empieza: 1 };
  const jugadores = ['Ana', 'Beto', 'Caro'];
  const nada = () => {};
  const salir = { to: '/juego/impostor', confirm: null };
  const conRouter = (el: ReactElement) => renderToStaticMarkup(<MemoryRouter>{el}</MemoryRouter>);
  const pasar = (jugador: number, viendo: boolean, pista = true, r = ronda) =>
    conRouter(
      <PasarCelu ronda={r} total={3} nombre={jugadores[jugador]} secreto={secretoDe(r, jugador, pista)} viendo={viendo} ultimo={jugador === 2}
        salir={salir} onVer={nada} onSiguiente={nada} />,
    );

  it('configuración: lista de ajustes, X, "?" y "Iniciar juego" (deshabilitado con menos de 3)', () => {
    const html = conRouter(<ImpostorPresencial />);
    for (const t of ['Jugadores', 'Impostores', 'Pista para el impostor', 'Ve la categoría', 'Temática', 'Mezcla', 'Rondas', 'Iniciar juego', 'Faltan 3 jugadores']) {
      expect(html).toContain(t);
    }
    expect(html).toMatch(/data-testid="ep-jugar"[^>]*disabled/);
    expect(html).toMatch(/role="switch" aria-checked="true"/);
    expect(html).toContain('data-testid="volver"');
    expect(html).toContain('aria-label="Cómo jugar"');
    expect(html).toContain('/avatars/impostor/hincha_');
  });

  it('el aviso "Faltan…" va justo arriba del botón y abajo queda el lugar de la barra (nada queda tapado)', () => {
    const html = conRouter(<ImpostorPresencial />);
    // La barra fija tiene el aviso y después el botón
    expect(html).toMatch(/data-testid="imp-barra"[\s\S]*Faltan 3 jugadores[\s\S]*data-testid="ep-jugar"/);
    // El espacio del alto de la barra va después de la última fila (Rondas), así haciendo scroll se ve todo
    expect(html).toMatch(/Rondas[\s\S]*data-testid="imp-espacio-barra"[\s\S]*data-testid="imp-barra"/);
    // Con uno solo de menos, en singular
    const dos = conRouter(
      <Configuracion jugadores={['Ana', 'Beto']} setJugadores={nada} ajustes={{ impostores: 1, pista: true }} setAjustes={nada}
        tematica="mezcla" setTematica={nada} rondas={3} setRondas={nada} cargando={false} error={null} onJugar={nada} />,
    );
    expect(dos).toContain('Falta 1 jugador (mínimo 3).');
  });

  it('impostores: − y + según la cantidad de jugadores; la pista apagada dice "No ve nada"', () => {
    const config = (n: number, impostores: number, pista = true) => conRouter(
      <Configuracion jugadores={Array.from({ length: n }, (_, i) => `J${i}`)} setJugadores={nada} ajustes={{ impostores, pista }} setAjustes={nada}
        tematica="mezcla" setTematica={nada} rondas={3} setRondas={nada} cargando={false} error={null} onJugar={nada} />,
    );
    const mas = (html: string) => /aria-label="Más impostores" disabled/.test(html);
    const menos = (html: string) => /aria-label="Menos impostores" disabled/.test(html);
    expect([mas(config(4, 1)), menos(config(4, 1))]).toEqual([true, true]); // 3-4 jugadores: sólo 1
    expect(config(4, 3)).toMatch(/data-testid="ep-impostores"[^>]*>1</); // si sacaron jugadores, baja solo
    expect([mas(config(6, 1)), menos(config(6, 1))]).toEqual([false, true]);
    expect([mas(config(6, 2)), menos(config(6, 2))]).toEqual([true, false]); // 5-7: hasta 2
    expect(mas(config(8, 2))).toBe(false); // 8 o más: hasta 3
    expect(mas(config(8, 3))).toBe(true);
    const apagada = config(5, 1, false);
    expect(apagada).toContain('No ve nada');
    expect(apagada).toMatch(/role="switch" aria-checked="false"/);
  });

  it('lista de jugadores: agregar (hasta 20 letras) y sacar', () => {
    const html = conRouter(<HojaJugadores jugadores={jugadores} setJugadores={nada} onCerrar={nada} />);
    expect(html).toContain('Jugadores (3)');
    expect(html).toContain('maxLength="20"');
    expect(html).toContain('aria-label="Sacar a Beto"');
    expect(html).toContain('Listo');
  });

  it('pasar el celu: "Jugador" chiquito y el nombre grande; antes de deslizar no aparece ninguna palabra', () => {
    const html = pasar(0, false);
    expect(html).toContain('>Jugador</p>');
    expect(html).toMatch(/data-testid="ep-pasar-a">Ana</);
    expect(html).toContain('Deslizá la tarjeta hacia arriba para ver tu palabra');
    expect(html).toContain('Ver mi palabra');
    expect(html).not.toContain('Riquelme');
    expect(html).not.toContain('data-testid="ep-secreto"');
    expect(pasar(2, false)).not.toContain('No tenés palabra');
  });

  it('hincha: su color, "Tu palabra es:" y la palabra grande; después "Jugador siguiente"', () => {
    const html = pasar(0, true);
    expect(html).toContain('Hincha');
    expect(html).toContain('Tu palabra es:');
    expect(html).toContain('Riquelme');
    expect(html).toContain('Jugador siguiente');
    expect(html).toContain('Tapá y pasá al siguiente jugador');
    expect(html).not.toContain('No tenés palabra');
  });

  it('impostor: rojo, "No tenés palabra"; la categoría sólo con la pista prendida', () => {
    const conPista = pasar(2, true, true);
    expect(conPista).toContain('Impostor');
    expect(conPista).toContain('No tenés palabra');
    expect(conPista).toContain('Pista: <strong');
    expect(conPista).toContain('Jugador</strong>');
    expect(conPista).not.toContain('Riquelme');
    const sinPista = pasar(2, true, false);
    expect(sinPista).toContain('No tenés palabra');
    expect(sinPista).toContain('Sin pista');
    expect(sinPista).not.toContain('Jugador</strong>');
    expect(sinPista).not.toContain('Riquelme');
  });

  it('el último jugador pasa directo a las pistas ("¡A dar pistas!")', () => {
    expect(pasar(1, true)).toContain('Jugador siguiente');
    expect(pasar(2, true)).toContain('¡A dar pistas!');
  });

  it('nunca se ve la palabra del anterior: la pantalla del siguiente arranca tapada', () => {
    // Ana vio "Riquelme"; la pantalla de Beto (sin deslizar) no tiene nada de la palabra
    expect(pasar(0, true)).toContain('Riquelme');
    const siguiente = pasar(1, false);
    expect(siguiente).toMatch(/data-testid="ep-pasar-a">Beto</);
    expect(siguiente).not.toContain('Riquelme');
    expect(siguiente).not.toContain('Tu palabra es');
    // En la ronda siguiente, tampoco aparece la palabra de la ronda anterior
    const ronda2: RondaEnPersona = { numero: 2, palabra: 'Boca Juniors', categoria: 'Equipo', impostores: [0], empieza: 0 };
    const html = pasar(1, true, true, ronda2);
    expect(html).toContain('Boca Juniors');
    expect(html).not.toContain('Riquelme');
  });

  it('pistas: "Empieza" y el nombre grande, la lista numerada y "¡A votar!"', () => {
    const html = conRouter(<Pistas ronda={ronda} total={3} jugadores={jugadores} salir={salir} onVotar={nada} />);
    expect(html).toMatch(/data-testid="ep-empieza">Beto</);
    expect(html).toMatch(/data-testid="ep-orden"[\s\S]*Beto[\s\S]*Caro[\s\S]*Ana/);
    expect(html).toContain('2 vueltas');
    expect(html).toContain('¡A votar!');
    expect(html).not.toContain('Riquelme');
  });

  it('votación: "Voten en voz alta", reloj opcional (empieza sin reloj) y "Revelar"', () => {
    const html = conRouter(<Votar ronda={ronda} total={3} salir={salir} onRevelar={nada} />);
    expect(html).toContain('Voten en voz alta');
    expect(html).toContain('Sin reloj');
    expect(html).toContain('30 s');
    expect(html).not.toContain('data-testid="ep-reloj"');
    expect(html).toContain('Revelar');
    expect(html).not.toContain('Riquelme');
  });

  it('revelación: uno o varios impostores y la palabra; en la última, "Ver final"', () => {
    const html = conRouter(<Revelacion ronda={ronda} total={3} jugadores={jugadores} ultima={false} salir={salir} onSiguiente={nada} />);
    expect(html).toContain('El impostor era');
    expect(html).toContain('Caro');
    expect(html).toContain('Riquelme');
    expect(html).toContain('Siguiente ronda');
    const varios = conRouter(<Revelacion ronda={{ ...ronda, impostores: [0, 2] }} total={3} jugadores={jugadores} ultima salir={salir} onSiguiente={nada} />);
    expect(varios).toContain('Los impostores eran');
    expect(varios).toContain('Ana');
    expect(varios).toContain('Caro');
    expect(varios).toContain('Ver final');
  });

  it('final: palabra e impostores de cada ronda y "Jugar de nuevo"', () => {
    const rondas = [ronda, { numero: 2, palabra: 'Boca Juniors', categoria: 'Equipo', impostores: [0, 1], empieza: 0 }];
    const html = conRouter(<Final rondas={rondas} jugadores={jugadores} cargando={false} error={null} salir={salir} onDeNuevo={nada} onCambiar={nada} />);
    for (const t of ['Riquelme', 'Caro', 'Boca Juniors', 'Ana', 'Beto', 'Jugar de nuevo', 'Cambiar ajustes']) expect(html).toContain(t);
  });

  it('"Cómo jugar": pasos numerados con título y botón "Cerrar"', () => {
    const html = renderToStaticMarkup(<ComoJugar pasos={COMO_JUGAR_EN_PERSONA} onCerrar={nada} />);
    expect(html).toContain('Cómo jugar');
    expect(html).toContain('Paso 1');
    expect(html).toContain(`Paso ${COMO_JUGAR_EN_PERSONA.length}`);
    expect(html).toContain('Pásense el celu');
    expect(html).toContain('Cerrar');
  });
});
