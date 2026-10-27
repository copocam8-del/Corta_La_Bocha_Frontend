import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { CircleUserRound, Flag, Gauge, Landmark, Play, Shapes, Shield, Tag, type LucideIcon } from 'lucide-react';
import { ABANDONAR } from '../components/abandonar';
import { menuPath } from '../games/multiConfig';
import GameResult from '../games/GameResult';
import { gameIcon } from '../games/gameIcons';
import { comoJugarDe } from '../games/comoJugar';
import { AjusteElegible, Encabezado, PantallaJuego } from '../games/ui/JuegoUI';
import { useNow } from '../multi/useNow';
import { secondsLeft } from '../game/round';
import { usePantallaMemotest } from '../games/usePantallaMemotest';
import {
  anchoMesa, columnasMemotest, empezarMemotest, medidasCarta, rendirseMemotest, TEMAS_MEMOTEST, voltearCarta,
  type CartaVista, type IconoCarta, type NivelMemotest, type PartidaMemotest,
} from '../api/memotest';

// Memotest futbolero: cartas de texto con íconos propios (sin escudos ni logos reales). El servidor
// revela cada carta al darla vuelta y decide si es par.

const ICONOS: Record<IconoCarta, LucideIcon> = { escudo: Shield, apodo: Tag, jugador: CircleUserRound, bandera: Flag, estadio: Landmark };
const ESPERA_MS = 900; // cuánto se ven dos cartas que no son par antes de taparse
const mensajeError = (e: unknown) =>
  (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'No se pudo conectar con el servidor. Probá de nuevo.';

export default function Memotest() {
  const pantalla = usePantallaMemotest();
  const [tema, setTema] = useState('clubes_apodos');
  const [nivel, setNivel] = useState<NivelMemotest>('facil');
  const [partida, setPartida] = useState<PartidaMemotest | null>(null);
  const [visibles, setVisibles] = useState<Record<number, CartaVista>>({}); // dadas vuelta (no descubiertas)
  const [fin, setFin] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const ocupado = useRef(false);
  const now = useNow(!!partida && !partida.terminada, 500);

  const empezar = async () => {
    setError(null);
    try {
      const p = await empezarMemotest(tema, nivel);
      setPartida(p);
      setVisibles({});
      setFin(Date.now() + p.restantes * 1000);
    } catch (e) {
      setError(mensajeError(e));
    }
  };

  useEffect(() => {
    if (!partida || partida.terminada) return;
    const t = setTimeout(() => void rendirseMemotest(partida.matchId).then(setPartida).catch((e) => setError(mensajeError(e))),
      Math.max(0, fin - Date.now()));
    return () => clearTimeout(t);
  }, [partida, fin]);

  const tocar = async (i: number) => {
    if (!partida || partida.terminada || ocupado.current) return;
    if (visibles[i] || partida.descubiertas.some((d) => d.indice === i)) return;
    ocupado.current = true;
    try {
      const r = await voltearCarta(partida.matchId, i);
      if (r.carta) setVisibles((v) => ({ ...v, [r.carta!.indice]: r.carta! }));
      if (r.primera && r.par === false) {
        // No es par: se ven un momento y se tapan
        setVisibles((v) => ({ ...v, [r.primera!.indice]: r.primera! }));
        setTimeout(() => { setVisibles({}); setPartida(r); ocupado.current = false; }, ESPERA_MS);
        return;
      }
      if (r.primera) setVisibles({});
      setPartida(r);
    } catch (e) {
      setError(mensajeError(e));
    }
    ocupado.current = false;
  };

  const salir = menuPath('memotest');
  const ayuda = comoJugarDe('memotest');

  if (!partida) {
    return (
      <PantallaJuego
        salir={{ to: salir }}
        ayuda={ayuda}
        barra={
          <button className="ui-boton" data-testid="empezar-memotest" onClick={() => void empezar()}>
            <Play size={20} fill="currentColor" /> ¡Arrancar!
          </button>
        }
      >
        <Encabezado icono={gameIcon('memotest')} kicker="Memotest" titulo="Encontrá los pares"
          texto="Da vuelta dos cartas: si van juntas (un club y su apodo, un jugador y su selección…) quedan a la vista." />
        <div className="card ui-filas">
          <AjusteElegible icono={Shapes} titulo="Tema" opciones={TEMAS_MEMOTEST.map((t) => ({ id: t.id, label: t.nombre }))}
            valor={tema} onElegir={setTema} testid="ajuste-tema" />
          <AjusteElegible icono={Gauge} titulo="Nivel" valor={nivel} onElegir={(n) => setNivel(n as NivelMemotest)} testid="ajuste-nivel"
            opciones={[
              { id: 'facil', label: 'Fácil · 12', sub: '6 pares, 2 minutos' },
              { id: 'medio', label: 'Medio · 16', sub: '8 pares, 3 minutos' },
              { id: 'dificil', label: 'Difícil · 20', sub: '10 pares, 4 minutos' },
            ]} />
        </div>
        {error && <div className="error">{error}</div>}
      </PantallaJuego>
    );
  }

  const restantes = partida.terminada ? 0 : Math.min(partida.segundos, secondsLeft(fin, now));
  const columnas = columnasMemotest(partida.cartas, pantalla.orientacion, pantalla.ancho);
  const medidas = medidasCarta(pantalla.orientacion, columnas);
  const descubiertas = new Map(partida.descubiertas.map((d) => [d.indice, d]));
  return (
    // En medio de la partida, salir = rendirse (cuenta como perdida)
    <PantallaJuego ayuda={ayuda} salir={{
      to: salir, confirm: partida.terminada ? null : ABANDONAR, onLeave: () => (partida.terminada ? undefined : rendirseMemotest(partida.matchId)),
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span className="kicker">{partida.tema}</span>
        <span className="kicker" data-testid="estado-memotest">
          {partida.encontrados}/{partida.pares} pares · {partida.movimientos} mov. · {Math.floor(restantes / 60)}:{String(restantes % 60).padStart(2, '0')}
        </span>
      </div>

      <div data-testid="mesa" data-columnas={columnas} className="ui-ancho"
        style={{ display: 'grid', gridTemplateColumns: `repeat(${columnas}, minmax(0, 1fr))`, gap: '8px', '--ancho': `${anchoMesa(pantalla.orientacion)}px` } as CSSProperties}>
        {Array.from({ length: partida.cartas }, (_, i) => {
          const d = descubiertas.get(i);
          const v = d ?? visibles[i];
          const Icon = v ? ICONOS[v.icono] : null;
          return (
            <button key={i} data-carta={i} onClick={() => void tocar(i)} aria-label={v ? v.texto : 'Carta boca abajo'}
              style={{
                aspectRatio: medidas.aspectRatio, minWidth: 0, borderRadius: '10px', cursor: v ? 'default' : 'pointer', padding: '6px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px',
                border: `1px solid ${d ? '#39ff8c' : v ? 'rgba(251,191,36,0.7)' : 'rgba(57,255,140,0.3)'}`,
                background: d ? 'rgba(57,255,140,0.16)' : v ? 'rgba(251,191,36,0.12)' : 'repeating-linear-gradient(135deg, #052e16 0 10px, #064a22 10px 20px)',
                color: '#eafff2', transition: 'background 0.25s ease, transform 0.25s ease', transform: v ? 'rotateY(0deg)' : 'none',
              }}>
              {v && Icon ? (
                <>
                  <Icon size={medidas.icono} color={d ? '#39ff8c' : '#fbbf24'} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: `${medidas.fontSize}px`, fontWeight: 600, lineHeight: 1.2, textAlign: 'center', overflowWrap: 'anywhere' }}>{v.texto}</span>
                </>
              ) : (
                <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: '22px', color: 'rgba(124,255,178,0.35)' }}>?</span>
              )}
            </button>
          );
        })}
      </div>

      {partida.terminada ? (
        <GameResult titulo={partida.gano ? '¡Memoria de crack!' : 'Se terminó el tiempo'} gano={!!partida.gano} puntos={partida.puntos ?? 0}
          logros={partida.logros} onJugarOtra={() => setPartida(null)}>
          <p style={{ fontSize: '14px', color: 'rgba(180,255,205,0.85)' }}>{partida.encontrados} pares en {partida.movimientos} movimientos</p>
        </GameResult>
      ) : (
        <button className="ghost-btn" onClick={() => void rendirseMemotest(partida.matchId).then(setPartida).catch((e) => setError(mensajeError(e)))}>
          <Flag size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> Rendirme
        </button>
      )}
      {error && <div className="error">{error}</div>}
    </PantallaJuego>
  );
}
