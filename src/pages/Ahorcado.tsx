import { useCallback, useEffect, useState } from 'react';
import { Flag, Gauge, Play } from 'lucide-react';
import { ABANDONAR } from '../components/abandonar';
import { menuPath } from '../games/multiConfig';
import Pelota from '../games/Pelota';
import GameResult from '../games/GameResult';
import { AHORCADO_CSS, Arriesgar, Mascara, Teclado } from '../games/AhorcadoUI';
import { comoJugarDe } from '../games/comoJugar';
import { AjusteElegible, Encabezado, PantallaJuego } from '../games/ui/JuegoUI';
import {
  arriesgarRespuesta, empezarAhorcado, probarLetra, rendirse,
  type DificultadAhorcado, type PartidaAhorcado,
} from '../api/ahorcado';

// Ahorcado "Que no muera la redonda". El servidor elige la palabra y corrige cada letra; acá sólo
// se muestra el estado. Se juega con el teclado de la pantalla (celular) o con el de la compu.

const DIFICULTADES: { id: DificultadAhorcado; label: string; sub: string }[] = [
  { id: 'facil', label: 'Fácil', sub: 'Nombres cortos y muy conocidos' },
  { id: 'medio', label: 'Medio', sub: 'Nombre y apellido, clubes y estadios' },
  { id: 'dificil', label: 'Difícil', sub: 'Más largos o menos conocidos' },
];

const mensajeError = (e: unknown) =>
  (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'No se pudo conectar con el servidor. Probá de nuevo.';

export default function Ahorcado() {
  const [dificultad, setDificultad] = useState<DificultadAhorcado | null>(null);
  const [elegida, setElegida] = useState<DificultadAhorcado>('medio'); // la de la lista (se juega al tocar "¡Arrancar!")
  const [partida, setPartida] = useState<PartidaAhorcado | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const empezar = async (d: DificultadAhorcado) => {
    setDificultad(d);
    setCargando(true);
    setError(null);
    try {
      setPartida(await empezarAhorcado(d));
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setCargando(false);
    }
  };

  const jugar = useCallback(async (accion: () => Promise<PartidaAhorcado>) => {
    setCargando(true);
    setError(null);
    try {
      setPartida(await accion());
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setCargando(false);
    }
  }, []);

  const letra = useCallback((l: string) => {
    if (!partida || partida.terminada || cargando) return;
    if (partida.adivinadas.includes(l) || partida.erradas.includes(l)) return;
    void jugar(() => probarLetra(partida.matchId, l));
  }, [partida, cargando, jugar]);

  // Teclado físico
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if ((ev.target as HTMLElement)?.tagName === 'INPUT') return;
      const k = ev.key.toUpperCase();
      if (/^[A-ZÑ]$/.test(k)) letra(k);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [letra]);

  const salir = menuPath('ahorcado');
  const ayuda = comoJugarDe('ahorcado');

  // ── Elegir dificultad ─────────────────────────────────────────────────────────────────────
  if (!partida) {
    return (
      <PantallaJuego
        salir={{ to: salir }}
        ayuda={ayuda}
        barra={
          <button className="ui-boton" data-testid="empezar-ahorcado" disabled={cargando} onClick={() => void empezar(elegida)}>
            <Play size={20} fill="currentColor" /> {cargando ? 'Preparando…' : '¡Arrancar!'}
          </button>
        }
      >
        <div style={{ display: 'flex', justifyContent: 'center' }}><Pelota errores={0} max={6} /></div>
        <Encabezado kicker="Ahorcado futbolero" titulo="Que no muera la redonda"
          texto="Adiviná el nombre letra por letra. Con cada error la pelota se desinfla: al sexto, muere la redonda." />
        <div className="card ui-filas">
          <AjusteElegible icono={Gauge} titulo="Dificultad" opciones={DIFICULTADES} valor={elegida}
            onElegir={(d) => setElegida(d as DificultadAhorcado)} testid="ajuste-dificultad" />
        </div>
        {error && <div className="error">{error}</div>}
      </PantallaJuego>
    );
  }

  const terminada = partida.terminada;
  return (
    // En medio de la partida, salir = rendirse (cuenta como perdida)
    <PantallaJuego ayuda={ayuda} salir={{
      to: salir, confirm: terminada ? null : ABANDONAR, onLeave: () => (terminada ? undefined : rendirse(partida.matchId)),
    }}>
      <style>{AHORCADO_CSS}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p className="kicker">Pista: <strong data-testid="pista">{partida.pista}</strong></p>
        <p className="kicker" data-testid="errores">Errores {partida.errores}/{partida.maxErrores}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Pelota errores={partida.errores} max={partida.maxErrores} />
      </div>

      <Mascara letras={terminada && partida.respuesta ? [...partida.respuesta.toUpperCase()] : partida.mascara} perdio={terminada && !partida.gano} />

      {terminada ? (
        <GameResult
          titulo={partida.gano ? '¡Salvaste la redonda!' : '¡Murió la redonda!'}
          gano={!!partida.gano}
          puntos={partida.puntos ?? 0}
          logros={partida.logros}
          onJugarOtra={() => void empezar(dificultad ?? partida.dificultad)}
        >
          <p style={{ fontSize: '14px', color: 'rgba(180,255,205,0.85)' }}>
            Era: <strong data-testid="respuesta">{partida.respuesta}</strong> · {partida.segundos} s
          </p>
        </GameResult>
      ) : (
        <>
          {/* Teclado en pantalla */}
          <Teclado adivinadas={partida.adivinadas} erradas={partida.erradas} onLetra={letra} bloqueado={cargando} />
          <Arriesgar bloqueado={cargando} onArriesgar={(texto) => void jugar(() => arriesgarRespuesta(partida.matchId, texto))} />
          <button className="ghost-btn" onClick={() => void jugar(() => rendirse(partida.matchId))} disabled={cargando}>
            <Flag size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} /> Rendirme
          </button>
        </>
      )}
      {error && <div className="error">{error}</div>}
    </PantallaJuego>
  );
}
